import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolao-neca-yomar.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: Array<{ path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/grupos", priority: 0.8, freq: "monthly" },
    { path: "/tabela", priority: 0.8, freq: "daily" },
    { path: "/regulamento", priority: 0.6, freq: "yearly" },
    { path: "/ranking", priority: 0.9, freq: "hourly" },
    { path: "/m/login", priority: 0.5, freq: "yearly" },
  ];
  return routes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
