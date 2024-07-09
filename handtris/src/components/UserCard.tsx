"use client";

import Image from "next/image";

type UserCardProps = {
  isLoading: boolean;
  bgColorFrom: string;
  bgColorTo: string;
  borderColor: string;
  user: {
    image: string;
    name: string;
    winrate: string;
    stats: string;
  };
};

export const UserCard = ({
  isLoading,
  bgColorFrom,
  bgColorTo,
  borderColor,
  user,
}: UserCardProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 bg-gradient-to-tl p-8 ${bgColorFrom} ${bgColorTo} w-5/12 border-[8px] shadow-lg ${borderColor} transform transition-transform duration-300`}
      style={{ height: "550px" }}
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-6 h-full py-2">
          <h1 className="pixel text-2xl animate-pulse">WAITING FOR SOMEONE</h1>
          <Image
            src="/gif/tetris_.gif"
            alt="loading"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>
      ) : (
        <>
          <Image
            src={user.image}
            alt="profile-pic"
            width={400}
            height={400}
            className={`border-[8px] ${borderColor} shadow-xl`}
          />
          <div className="space-y-2 text-center pixel">
            <h1 className="text-4xl font-extrabold tracking-wide text-white">
              {user.name}
            </h1>
            <h2 className="text-2xl font-medium text-gray-300">
              WINRATE: <span className="text-green-400">{user.winrate}</span>
            </h2>
            <h3 className="text-xl font-medium text-gray-300">
              RECENT STATS: <span className="text-red-400">{user.stats}</span>
            </h3>
          </div>
        </>
      )}
    </div>
  );
};
