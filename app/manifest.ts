import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bolão Yomar e Família — Copa 2026",
    short_name: "Bolão",
    description: "Boletim do bolão familiar da Copa do Mundo de 2026.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf4",
    theme_color: "#0b6b3a",
    lang: "pt-BR",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
    categories: ["sports", "entertainment", "social"],
  };
}
