"use client";

import { useEffect, useState } from "react";

export function ThemeClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or <div className="invisible" /> if you want layout preserved
  }

  return <>{children}</>;
}

