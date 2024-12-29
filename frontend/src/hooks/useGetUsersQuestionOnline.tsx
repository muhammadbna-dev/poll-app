import type { UserQuestionOnline } from "@/types";
import { useEffect, useState } from "react";

export const useGetUsersQuestionOnline = () => {
	const [result, setResult] = useState<UserQuestionOnline>();

	const getUserCount = async () => {
		const data = await fetch(`api/users`);
		const json = await data.json();
		setResult(json.data);
	};

	useEffect(() => {
		getUserCount();
		const intervalId = setInterval(getUserCount, 1000);
		return () => clearInterval(intervalId);
	}, []);

	return result;
};
