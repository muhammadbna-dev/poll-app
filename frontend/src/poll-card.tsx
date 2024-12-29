import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import { useGetAnsweredQuestions } from "@/hooks/useGetAnsweredQuestions";
import { useGetResults } from "@/hooks/useGetResults";
import { useGetUsersQuestionOnline } from "@/hooks/useGetUsersQuestionOnline";
import type { Poll } from "@/types";
import { createRef, useEffect, useState } from "react";

const PollCard = ({ poll, session }: { session: string; poll: Poll }) => {
	const result = useGetResults(poll._id);
	const userQuestionsOnline = useGetUsersQuestionOnline();
	const { answered: answeredQuestions, trigger: triggerAnsweredQuestions } =
		useGetAnsweredQuestions(poll?._id, session);
	const [cardRefs, setCardRefs] = useState<
		{ ref: React.RefObject<HTMLDivElement>; questionId: string }[]
	>([]);
	const [cardObservers, setCardObservers] = useState<IntersectionObserver[]>(
		[],
	);

	const postResponse = async (questionId: string, optionId: string) => {
		await fetch(`api/result`, {
			method: "POST",
			body: JSON.stringify({
				poll: poll?._id,
				question: questionId,
				option: optionId,
				session: session,
			}),
		});
		triggerAnsweredQuestions();
	};

	useEffect(() => {
		if (poll) {
			setCardRefs((refs) => {
				return poll.questions.map((question, i) => {
					const ref = refs[i]?.ref ?? createRef();
					return {
						questionId: question._id,
						ref,
					};
				});
			});
		}
	}, [poll]);

	useEffect(() => {
		if (cardRefs.length > 0) {
			const observers = [];
			for (const ref of cardRefs) {
				const observer = new IntersectionObserver(
					(entries) => {
						Promise.all(
							entries.map(async (entry) => {
								const questionId = entry.target.id;
								if (entry.isIntersecting) {
									await fetch(`api/users/${questionId}`, {
										method: "POST",
										body: JSON.stringify({
											user: session,
										}),
									});
								} else {
									await fetch(`api/users/${questionId}`, {
										method: "DELETE",
										body: JSON.stringify({
											user: session,
										}),
									});
								}
							}),
						);
					},
					{ threshold: 1 },
				);

				if (ref.ref.current) {
					observer.observe(ref.ref.current);
					observers.push(observer);
				}
				setCardObservers(observers);
			}
		}
	}, [cardRefs]);

	useEffect(() => {
		return () => {
			for (const observer of cardObservers) {
				observer.disconnect();
			}
		};
	}, [cardObservers]);

	return poll ? (
		<div className="flex flex-col gap-5 h-[100%]">
			{poll.questions.map((question, i) => {
				return (
					<Card
						id={question._id}
						className="w-[60%] p-7 flex flex-col gap-5"
						key={question._id}
						ref={cardRefs?.[i]?.ref}
					>
						<CardTitle>{question.text}</CardTitle>
						<CardDescription>{`User count: ${userQuestionsOnline ? (userQuestionsOnline[question._id] ?? 0) : 0}`}</CardDescription>
						<CardContent>
							<div className="flex flex-col gap-5">
								{question.options.map((option) => {
									const count = result?.[question?._id]?.[option?._id] ?? 0;

									if (answeredQuestions.includes(question._id)) {
										return (
											<div key={option._id}>
												{option.text} = {count}
											</div>
										);
									} else {
										return (
											<Button
												variant="secondary"
												key={option._id}
												onClick={() => postResponse(question._id, option._id)}
											>{`${option.text} : ${count}`}</Button>
										);
									}
								})}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	) : (
		<></>
	);
};

export default PollCard;
