import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
    preview: {
    allowedHosts: [
      "https://frontend-production-3f56.up.railway.app",
      "noteb.up.railway.app",
    ],
  },
});
