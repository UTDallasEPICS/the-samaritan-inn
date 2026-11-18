import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: "standalone",
  // ponytail: main has 21 pre-existing lint errors that fail `next build`; lint
  // runs separately via `pnpm lint`. Drop this once that is clean.
  eslint: { ignoreDuringBuilds: true },
  // The reset link carries its token in the URL; keep it out of Referer headers.
  async headers() {
    return [
      {
        source: "/auth/reset-password",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
