import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_TARGET || "http://localhost:3001";
  const apiPrefix = env.VITE_API_PREFIX || "/api";

  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      hmr: { overlay: false },
      proxy: {
        [apiPrefix]: {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    resolve: {
      dedupe: ["react", "react-dom", "react/jsx-runtime"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
