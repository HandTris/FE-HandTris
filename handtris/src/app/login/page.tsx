"use client";

import React from "react";
const LoginForm = dynamic(() => import("../../components/LoginForm"));
import dynamic from "next/dynamic";

const LoginPage = () => {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
