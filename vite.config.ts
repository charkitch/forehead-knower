import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/forehead-knower/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
