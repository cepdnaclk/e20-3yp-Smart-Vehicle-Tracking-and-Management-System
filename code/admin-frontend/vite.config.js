import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api":
        "https://trackmasterpro-faethrezd6cvauee.southindia-01.azurewebsites.net/", // Proxy API requests to backend
    },
  },
});
