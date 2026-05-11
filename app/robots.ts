import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolao-neca-yomar.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/grupos", "/tabela", "/regulamento", "/ranking"],
        disallow: ["/m/", "/auth/", "/admin", "/dev/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
