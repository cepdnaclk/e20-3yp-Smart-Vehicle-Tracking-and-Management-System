import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Set the base URL for assets
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          chart: ['chart.js', 'chartjs-plugin-datalabels'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": "https://trackmasterpro-faethrezd6cvauee.southindia-01.azurewebsites.net/", // Proxy API requests to backend
    },
  },
});
