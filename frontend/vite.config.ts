import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		host: true,
		proxy: {
			"/api": {
				target: "http://backend:8080",
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
