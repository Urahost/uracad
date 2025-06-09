"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const RefreshPage = () => {
  const router = useRouter();

  useEffect(() => {
    window.location.reload();
  }, [router]);

  return null;
};
