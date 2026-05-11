"use client";

import { useEffect } from "react";

export function AutoPrint() {
  useEffect(() => {
    // Espera fontes carregarem antes de imprimir
    const t = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(t);
  }, []);
  return null;
}
