import React from "react";
import Image from "next/image";

interface LoadingScreenProps {
  progress: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Image
          src="/image/hand_tris_logo.png"
          alt="HandTris Logo"
          width={800}
          height={800}
          className="animate-pulse w-full object-contain"
        />
        <h2 className="text-4xl font-bold text-center text-white pixel">
          HandTris
        </h2>
        <div className="space-y-4">
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-2xl text-gray-200 text-center pixel">
            Loading... {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
