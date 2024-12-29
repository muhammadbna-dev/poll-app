export type Poll = {
	_id: string;
	name: string;
	questions: {
		_id: string;
		text: string;
		options: {
			_id: string;
			text: string;
		}[];
	}[];
};

export type Result = {
	[questionId: string]: {
		[optionId: string]: number;
	};
};

export type UserQuestionOnline = {
	[questionId: string]: number;
};
