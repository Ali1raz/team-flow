---
name: nextjs-seo
description: >
  Implement production-grade SEO for any Next.js App Router application.
  Use this skill when the user asks to: add SEO, set up metadata, configure OG
  images, add robots rules, implement sitemaps, audit SEO, set up title
  templates, add structured data (JSON-LD), or improve social sharing previews.
  Covers the full stack: root metadata, layout inheritance, per-page static and
  dynamic metadata, file-convention OG images, robots.ts, sitemap.ts, and
  canonical URLs. Works for any route structure — public marketing sites,
  authenticated apps, mixed public/auth portals.
---

# Next.js SEO Skill

## Overview

This skill implements production-grade SEO for **any Next.js App Router app**.
It is deliberately app-agnostic: all examples use placeholder names so the AI
agent can substitute the real app's routes, brand, and data-fetching functions.

The skill is organized into **seven phases**. Work through them in order on a new
project; jump to the relevant phase when patching an existing one.

---

## Phase 1 — Audit Your Route Structure

Before writing a single line, map every route into one of three buckets:

| Bucket | Crawlable? | Metadata depth |
|--------|-----------|----------------|
| **Public static** | ✅ index + follow | `export const metadata` with description + OG |
| **Public dynamic** | ✅ index + follow | `generateMetadata()` + per-record OG |
| **Protected / auth** | ❌ noindex | Title only (inherited from layout) |

### Decision tree — apply to every route

```
Is this route publicly accessible without login?
├── No  → Protected. Title only + robots: noindex.
└── Yes → Is the content unique per URL? (record-level: post, profile, product)
          ├── Yes → Dynamic. Use generateMetadata() + OG image per record.
          └── No  → Static. export const metadata + shared OG image.
```

### Worked example — typical SaaS / workspace app

```
Route                                        Bucket
─────────────────────────────────────────────────────
/                                            Public static
/login                                       Protected (noindex)
/accept-invite/[id]                          Protected (noindex, sensitive)
/profile                                     Protected (noindex)
/workspaces                                  Protected (noindex)
/workspaces/[workspaceId]                    Protected (noindex)
/workspaces/[workspaceId]/channel/[channelId]          Protected (noindex)
/workspaces/[workspaceId]/channel/[channelId]/members  Protected (noindex)
```

> **Key insight:** for mostly-authenticated apps, the root `/` is the only
> public page worth optimising. All auth-gated routes get `noindex` and skip OG
> entirely.

---

## Phase 2 — Root Layout Metadata (`app/layout.tsx`)

This is the single source of truth for site-wide defaults. Every child page
inherits from here and can override specific fields.

```ts
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  // Required: turns relative paths into absolute URLs for OG images
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

  // Title template: child pages set `title: "Page Name"` → "Page Name | App Name"
  title: {
    template: "%s | <AppName>",
    default: "<AppName>",          // shown when no child overrides title
  },

  description: "<One-sentence description of what the app does.>",

  openGraph: {
    siteName: "<AppName>",
    type: "website",
    images: ["/og-default.png"],   // static fallback in /public
  },

  twitter: {
    card: "summary_large_image",
  },

  // Block everything by default; public pages opt-in explicitly
  robots: {
    index: false,
    follow: false,
  },
};
```

### Why default to `noindex: true`?

Authenticated apps have far more protected routes than public ones. Defaulting
to `noindex` means a newly added route is never accidentally indexed. Public
pages explicitly opt in with `robots: { index: true, follow: true }`.

---

## Phase 3 — Segment Layouts for Groups

If your app uses route groups (e.g. `(auth)`, `(marketing)`, `(admin)`), add a
layout in each group to set the right title template and robots baseline.

```ts
// app/(auth)/layout.tsx  — covers all authenticated routes
import type { Metadata } from "next";

export const metadata: Metadata = {
  // Template visible in browser tabs when multiple tabs are open
  title: {
    template: "%s | <AppName>",
    default: "<AppName>",
  },
  robots: { index: false, follow: false },
};
```

```ts
// app/(marketing)/layout.tsx  — covers all public/landing routes
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | <AppName>",
    default: "<AppName>",
  },
  // Public group allows indexing; individual pages still opt in explicitly
  robots: { index: true, follow: true },
};
```

> **When you don't have route groups:** skip this phase. The root layout default
> is sufficient for small apps.

---

## Phase 4 — Per-Page Metadata

### 4a. Public static page

```ts
// app/page.tsx  (or any non-dynamic public page)
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "<Page Title>",             // becomes "<Page Title> | <AppName>"
  description: "<150 chars max. What will the visitor find here?>",
  alternates: {
    canonical: "/",                  // always set canonical on public pages
  },
  openGraph: {
    title: "<Page Title>",
    description: "<Same or slightly expanded description>",
    url: "/",
    images: [
      {
        url: "/og-home.png",         // 1200×630 px, <8 MB, in /public
        width: 1200,
        height: 630,
        alt: "<Descriptive alt text>",
      },
    ],
  },
  robots: { index: true, follow: true },  // explicit opt-in
};

export default function HomePage() {
  return <main>…</main>;
}
```

### 4b. Public dynamic page (per-record content)

Use `generateMetadata` — it runs on the server before rendering.

```ts
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchItem(slug);          // your data-fetching function

  if (!item) {
    return {
      title: "Not Found",
      robots: { index: false },
    };
  }

  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: item.title,
      description: item.summary,
      type: "article",
      publishedTime: item.createdAt.toISOString(),
      authors: [item.author.name],
      images: [
        {
          url: `/blog/${slug}/opengraph-image`,  // file-convention OG (Phase 5a)
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.summary,
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const item = await fetchItem(slug);
  return <article>…</article>;
}
```

> **Rule:** never export both `metadata` and `generateMetadata` from the same
> file — Next.js only uses one. Use `generateMetadata` whenever any field
> depends on route params or fetched data.

### 4c. Protected page (auth-gated)

```ts
// app/workspaces/[workspaceId]/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace",
  // robots: noindex is inherited from the (auth) layout — no need to repeat
};

export default async function WorkspacePage() {
  return <div>…</div>;
}
```

---

## Phase 5 — OG Images

Two approaches; choose based on whether content is static or dynamic.

### 5a. File-convention OG image (recommended for dynamic routes)

Place an `opengraph-image.tsx` alongside `page.tsx`. Next.js auto-generates the
`<meta og:image>` tag — no manual wiring needed.

```ts
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const alt = "<App Name> Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const item = await fetchItem(slug);   // reuse same fetch; Next.js dedupes it

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ fontSize: 28, opacity: 0.6, marginBottom: 16 }}>
          <AppName>
        </p>
        <h1 style={{ fontSize: 64, fontWeight: "bold", textAlign: "center", lineHeight: 1.2 }}>
          {item?.title ?? "Untitled"}
        </h1>
      </div>
    ),
    { ...size }
  );
}
```

**Why file-convention over `/api/og` route?**

| | File convention (`opengraph-image.tsx`) | API route (`/api/og`) |
|---|---|---|
| Meta tag wiring | Automatic | Manual in `generateMetadata` |
| Per-route params | Native (`params` prop) | Query string |
| Caching | Cached by Next.js by default | Manually set `Cache-Control` |
| Best for | Per-record pages | Shared templates, external consumers |

### 5b. Static OG image (simple case)

Drop a `1200×630` PNG into `/public` and reference it in root layout metadata:

```ts
openGraph: {
  images: ["/og-default.png"],
}
```

Use this for: landing pages, static marketing pages, any route where content
never changes per-URL.

### 5c. Shared `/api/og` route (optional, for external consumers)

```ts
// app/api/og/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "<AppName>";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "white",
          fontSize: 64,
          fontWeight: "bold",
          padding: "80px",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        {title}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

> If you add an `/api/og` route, **allow it in `robots.ts`** so social crawlers
> can reach it (see Phase 6).

---

## Phase 6 — `robots.ts` and `sitemap.ts`

### robots.ts

Prefer the TypeScript file over a static `robots.txt` — it can read env vars
and is type-safe.

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",          // block private API routes
          // list auth-only path prefixes:
          "/workspaces/",
          "/profile",
          "/accept-invite/",
        ],
      },
      {
        userAgent: "*",
        allow: "/api/og/", // allow OG image route if you have one
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

### sitemap.ts

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  // Static public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // add more static public routes here
  ];

  // Dynamic public pages — uncomment and adapt if you have them
  // const items = await fetchAllPublicItems();
  // const dynamicRoutes: MetadataRoute.Sitemap = items.map((item) => ({
  //   url: `${baseUrl}/blog/${item.slug}`,
  //   lastModified: item.updatedAt,
  //   changeFrequency: "monthly" as const,
  //   priority: 0.8,
  // }));

  return [
    ...staticRoutes,
    // ...dynamicRoutes,
  ];
}
```

---

## Phase 7 — Structured Data (JSON-LD) (Optional, High Impact)

Structured data enables Google rich results (breadcrumbs, article bylines,
FAQs, product ratings). Inject it server-side via a `<script>` tag — no extra
library needed.

```ts
// app/blog/[slug]/page.tsx
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const item = await fetchItem(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.summary,
    datePublished: item.createdAt.toISOString(),
    dateModified: item.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: item.author.name,
    },
    image: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}/opengraph-image`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>…</article>
    </>
  );
}
```

**Common schema types:**

| Content type | `@type` |
|---|---|
| Blog post / news article | `Article` / `NewsArticle` |
| Product page | `Product` |
| FAQ section | `FAQPage` |
| Breadcrumb trail | `BreadcrumbList` |
| Organization / company | `Organization` |
| Website root | `WebSite` |

Validate at: **https://search.google.com/test/rich-results**

---

## Quick Reference

### Checklist per route

- [ ] Classified as public static / public dynamic / protected?
- [ ] `title` set (≤60 chars, specific to page)?
- [ ] `description` set on public pages (50–160 chars)?
- [ ] `alternates.canonical` set on all public pages?
- [ ] `robots` set correctly (or inherited from layout)?
- [ ] OG image present on public pages?
- [ ] `generateMetadata` used (not `metadata`) if content depends on params?
- [ ] `metadataBase` set in root layout?

### robots combinations

| Situation | `index` | `follow` |
|---|---|---|
| Public page | ✅ | ✅ |
| Auth-gated page | ❌ | ❌ |
| Paginated list (`?page=2`) | ❌ | ✅ |
| Staging / preview env | ❌ | ❌ |
| Search results page | ❌ | ✅ |

### Title length guide

- **Page title:** ≤60 characters (Google truncates around here)
- **Description:** 50–160 characters
- **OG title:** ≤60 characters
- **OG description:** ≤200 characters (platforms vary)

---

## Common Mistakes

1. **Forgetting `metadataBase`** — relative OG image paths become `<missing>` in
   social previews.
2. **Exporting both `metadata` and `generateMetadata`** — Next.js silently ignores
   one. Use `generateMetadata` whenever any field is dynamic.
3. **Using `noindex` for security** — it hides pages from search, not from users.
   Protect sensitive routes with authentication middleware.
4. **Duplicating OG/Twitter fields manually** — when using the file convention
   (`opengraph-image.tsx`), Next.js wires the `<meta>` tags automatically; you
   don't need `images: [...]` in `generateMetadata` as well unless you're
   overriding.
5. **Blocking the OG image route in robots.txt** — social crawlers (Twitterbot,
   facebookexternalhit) fetch image URLs independently; make sure `/api/og/`
   is allowed.
6. **Not setting `canonical`** — paginated routes, filter URLs, and trailing-slash
   variants create duplicate content. Always set `alternates.canonical`.
7. **OG images over 8 MB** — Next.js build will fail for file-convention images
   that exceed the limit. Keep generated images under 500 KB for fast caching.

---

## Debugging

| Symptom | Check |
|---|---|
| Page not in Google | `robots: { index: true }` on page or parent layout? |
| OG preview shows wrong/old image | Use platform's cache-busting tool (Twitter Card Validator, Facebook Debugger). Add a query param to bust CDN cache. |
| `metadataBase` warning in console | Set it in root layout: `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!)` |
| Title shows `undefined \| AppName` | Child page not exporting `metadata.title` or returning `undefined` from `generateMetadata` |
| JSON-LD not appearing in rich results test | Confirm `<script type="application/ld+json">` is server-rendered (not inside a client component) |
| Sitemap returns 404 | Check that `app/sitemap.ts` exports a default function (not a named export) |
