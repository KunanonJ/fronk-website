/**
 * Icon keys for portfolio diagrams (workflow steps, architecture nodes).
 * Brand ids map to `simple-icons`; generic ids map to `lucide-react` in
 * `components/landing/portfolio/VisualIcon.tsx`. Consumer platforms (YouTube,
 * TikTok, …) deliberately use generic icons, not their logos.
 */
export type VisualBrandIconId =
  | "nextdotjs"
  | "tailwindcss"
  | "shadcnui"
  | "express"
  | "socketdotio"
  | "postgresql"
  | "supabase"
  | "googlegemini"
  | "anthropic"
  | "turborepo"
  | "vercel"
  | "githubactions"
  | "github"
  | "nodedotjs"
  | "javascript"
  | "resend"
  | "html5"
  | "css"
  | "python"
  | "githubpages"
  | "googlecloud"
  | "googlesheets"
  | "fastapi"
  | "ffmpeg";

export type VisualGenericIconId =
  | "users"
  | "server"
  | "database"
  | "sparkles"
  | "mail"
  | "clock"
  | "network"
  | "filetext"
  | "listchecks"
  | "bell"
  | "building"
  | "pen"
  | "eye"
  | "copy"
  | "search"
  | "scissors"
  | "send"
  | "usercheck"
  | "layers"
  | "trendingdown"
  | "shieldalert"
  | "gitcommit"
  | "image"
  | "video"
  | "globe"
  | "monitor";

export type VisualIconId = VisualBrandIconId | VisualGenericIconId;
