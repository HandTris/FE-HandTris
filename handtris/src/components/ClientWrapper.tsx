"use client";

import React, { Suspense } from "react";
import { usePreventBackNavigation } from "@/hook/usePreventBackNavigation";

function ClientContent({ children }: { children: React.ReactNode }) {
  usePreventBackNavigation();
  return <>{children}</>;
}

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientContent>{children}</ClientContent>
    </Suspense>
  );
}
