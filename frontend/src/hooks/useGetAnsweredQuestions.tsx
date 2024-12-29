import { useEffect, useState } from "react";

export const useGetAnsweredQuestions = (
	pollId: string | undefined,
	session: string,
) => {
	const [answered, setAnswered] = useState<string[]>([]);

	const callApi = async () => {
		const data = await fetch(`api/result/get-answered`, {
			method: "POST",
			body: JSON.stringify({
				pollId,
				session,
			}),
		});
		const json = await data.json();
		setAnswered(json.data);
	};

	useEffect(() => {
		callApi();
	}, []);

	const trigger = () => {
		callApi();
	};

	return { answered, trigger };
};
