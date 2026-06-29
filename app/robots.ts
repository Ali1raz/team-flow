import type { MetadataRoute } from "next";
import { SITE } from "@/lib/app/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/workspaces/", "/profile", "/accept-invite/"],
      },
      {
        userAgent: "*",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
