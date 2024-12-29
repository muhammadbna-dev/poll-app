import { createRoot } from "react-dom/client";

import "@/index.css";
import App from "@/app";

const dom = document.getElementById("root");
if (dom) {
	createRoot(dom).render(
		<div className="w=[100vw] h-[100vh] flex items-center justify-center">
			<App />
		</div>,
	);
}
