"use client";

import React from "react";
import { usePreventBackNavigation } from "@/hook/usePreventBackNavigation";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  usePreventBackNavigation();
  return <>{children}</>;
}
