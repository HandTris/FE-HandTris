"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PacmanLoader } from "react-spinners";
import { createPortal } from "react-dom";

export const UserCard = ({
  isLoading,
  bgColorFrom,
  bgColorTo,
  borderColor,
  user,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 bg-gradient-to-tl p-8 ${bgColorFrom} ${bgColorTo} w-5/12 rounded-2xl border-4 shadow-lg ${borderColor} transform transition-transform duration-300`}
      style={{ height: "550px" }}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex items-center justify-center">
            <PacmanLoader color={"white"} loading={isLoading} size={70} />
          </div>
          <div className="space-y-2 text-center">
            <div className="mx-auto h-10 w-32 rounded bg-gray-700"></div>
            <div className="mx-auto h-8 w-24 rounded bg-gray-700"></div>
            <div className="mx-auto h-8 w-16 rounded bg-gray-700"></div>
          </div>
        </div>
      ) : (
        <>
          <Image
            src={user.image}
            alt={"profile-pic"}
            width={450}
            height={450}
            className={`rounded-full border-4 ${borderColor} shadow-xl`}
          />
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-extrabold tracking-wide text-white">
              {user.name}
            </h1>
            <h2 className="text-2xl font-medium text-gray-300">
              WINRATE: <span className="text-green-400">{user.winrate}</span>
            </h2>
            <h3 className="text-xl font-medium text-gray-300">
              STATS: <span className="text-red-400">{user.stats}</span>
            </h3>
          </div>
        </>
      )}
    </div>
  );
};
