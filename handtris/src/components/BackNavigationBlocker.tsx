"use client";
import { usePreventBackNavigation } from "@/hook/usePreventBackNavigation";

export function BackNavigationBlocker() {
  usePreventBackNavigation();
  return null;
}
