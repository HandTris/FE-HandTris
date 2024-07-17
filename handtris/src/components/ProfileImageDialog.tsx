"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { useRef, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";

type ProfileImageDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  nickname: string;
  onImageChange: () => void;
};

const ProfileImageDialog = ({
  isOpen,
  onClose,
  imageUrl,
  nickname,
  onImageChange,
}: ProfileImageDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChangeProfileImage = useCallback(
    async (selectedFile: File) => {
      try {
        const token = Cookies.get("accessToken");
        const formData = new FormData();
        formData.append("profileImage", selectedFile);
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${token}`);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/change/profileImage`,
          {
            method: "PATCH",
            body: formData,
            headers: headers,
          },
        );

        if (response.ok) {
          onImageChange();
          toast({
            title: "이미지 변경 성공",
            description: "이미지가 변경되었습니다.",
            variant: "default",
          });
          onClose();
        } else {
          if (response.status === 400) {
            const errorData = await response.json();
            if (errorData.message === "지원하지 않는 타입입니다.") {
              toast({
                title: "지원하지 않는 확장자입니다.",
                description: "JPG, PNG, JPEG 파일로 올려주세요.",
                variant: "destructive",
              });
            }
          } else {
            throw new Error("이미지 업로드 실패");
          }
        }
      } catch (error) {
        console.error("이미지 변경 중 오류 발생:", error);
        toast({
          title: "이미지 변경 실패",
          description: "이미지 변경 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    },
    [onClose, onImageChange],
  );

  const handleRemoveProfileImage = useCallback(async () => {
    try {
      const token = Cookies.get("accessToken");
      const headers = new Headers();
      headers.set("Authorization", `Bearer ${token}`);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/change/profileImage`,
        {
          method: "DELETE",
          headers: headers,
        },
      );

      if (response.ok) {
        onImageChange(); // 이미지 제거 성공 시 콜백 함수 호출
        onClose(); // 다이얼로그 닫기
      } else {
        throw new Error("이미지 제거 실패");
      }
    } catch (error) {
      console.error("이미지 제거 중 오류 발생:", error);
      toast({
        title: "이미지 제거 실패",
        description: "이미지 제거 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  }, [onClose, onImageChange]);
  const onClickImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleChangeProfileImage(selectedFile);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50" />{" "}
      <DialogContent
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-96 relative sm:max-w-md"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -45%)",
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-2xl font-semibold">{nickname}</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-6 rounded-md bg-red-500 p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-black"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <Image
          src={imageUrl || "/image/profile_1.jpeg"}
          alt="profile"
          width={480}
          height={480}
          className="rounded-2xl mb-4 border-4 border-green-500 mt-4"
        />

        <div className="flex justify-center space-x-4 mb-4">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button
            onClick={onClickImageUpload}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            이미지 변경
          </Button>
          <Button
            onClick={handleRemoveProfileImage}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            이미지 제거
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileImageDialog;
