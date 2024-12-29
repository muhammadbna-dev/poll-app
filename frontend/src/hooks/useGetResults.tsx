import type { Result } from "@/types";
import { useEffect, useState } from "react";

export const useGetResults = (pollId: string) => {
	const [result, setResult] = useState<Result>();

	const getResults = async () => {
		const data = await fetch(`api/result/generate`, {
			method: "POST",
			body: JSON.stringify({
				pollId,
			}),
		});
		const json = await data.json();
		setResult(json.data);
	};

	useEffect(() => {
		getResults();
		const intervalId = setInterval(getResults, 1000);
		return () => clearInterval(intervalId);
	}, []);

	return result;
};
