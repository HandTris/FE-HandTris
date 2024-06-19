"use client";
import { signIn, signOut } from "next-auth/react";
import React from "react";

type Props = {};

function LoginBtn({}: Props) {
  return (
    <div>
      <button
        className=""
        onClick={() => {
          signIn("github", {
            callbackUrl: "http://localhost:3000",
          });
        }}
      >
        로그인
      </button>
    </div>
  );
}

export default LoginBtn;
