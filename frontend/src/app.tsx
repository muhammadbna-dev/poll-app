import PollCard from "@/poll-card";
import type { Poll } from "@/types";
import { useEffect, useState } from "react";

const POLL_ID = "676f620539d6e65986f13bac";

const App = () => {
	const [poll, setPoll] = useState<Poll>();
	const [userSession, setUserSession] = useState<string>("");

	const generateSessionId = () => {
		return (Math.random() + 1).toString(36).substring(7);
	};

	const saveOnlineUser = async () => {
		const savedSession = localStorage.getItem("session")
		if (savedSession) {
			setUserSession(savedSession)
		} else {
			const session = generateSessionId();
			localStorage.setItem("session", session)
			await fetch(`api/users`, {
				method: "POST",
				body: JSON.stringify({
					user: session,
				}),
			});
			setUserSession(session);
		}
	};

	useEffect(() => {
		(async () => {
			try {
				await saveOnlineUser();
				const data = await fetch(`api/poll/${POLL_ID}`);
				const json = await data.json();
				setPoll(json.data);
			} catch (err) {
				console.error(err);
			}
		})();
	}, []);

	useEffect(() => {
		if (poll && userSession) {
			// TODO: removeventlistener
			addEventListener("beforeunload", async () => {
				if (poll) {
					await Promise.all(
						poll.questions.map(async (question) => {
							await fetch(`api/users/${question._id}`, {
								method: "DELETE",
								keepalive: true,
								body: JSON.stringify({
									user: userSession,
								}),
							});
						}),
					);
				}
			});
		}
	}, [poll, userSession]);

	if (poll) {
		return <PollCard session={userSession} poll={poll} />;
	}

	return <></>;
};

export default App;
