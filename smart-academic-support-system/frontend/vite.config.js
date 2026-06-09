import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (mode === "production") {
    const apiUrl = env.VITE_API_URL?.trim();
    if (!apiUrl) {
      throw new Error("VITE_API_URL is required for production builds");
    }

    const parsedUrl = new URL(apiUrl);
    if (parsedUrl.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(parsedUrl.hostname)) {
      throw new Error("VITE_API_URL must be the public HTTPS backend URL for production builds");
    }
    if (!parsedUrl.pathname.replace(/\/+$/, "").endsWith("/api")) {
      throw new Error("VITE_API_URL must end with /api");
    }
  }

  return {
    plugins: [react()],
    server: {
      port: 5173
    }
  };
});
