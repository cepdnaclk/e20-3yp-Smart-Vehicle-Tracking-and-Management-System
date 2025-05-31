import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/socket.io": {
        target:
          "https://trackmasterpro-faethrezd6cvauee.southindia-01.azurewebsites.net/",
        ws: true,
        changeOrigin: true,
      },
      "/api": {
        target:
          "https://trackmasterpro-faethrezd6cvauee.southindia-01.azurewebsites.net/",
        changeOrigin: true,
      },
    },
  },
});
