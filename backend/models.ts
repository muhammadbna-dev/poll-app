import mongoose from 'mongoose';
const { Schema, } = mongoose;


export interface IOption {
  text: string
}
const OptionSchema = new Schema<IOption>({
  text: String,
})
export const Option = mongoose.model('Option', OptionSchema)

export interface IQuestion {
  text: string
  options: IOption[]
}
const QuestionSchema = new Schema<IQuestion>({
  text: String,
  options: [OptionSchema]
})
export const Question = mongoose.model('Question', QuestionSchema)

export interface IPoll {
  name: string,
  questions: IQuestion[]
}
const PollSchema = new Schema<IPoll>({
  name: String,
  questions: [QuestionSchema]
});
export const Poll = mongoose.model('Poll', PollSchema);

export interface IResults {
  poll: IPoll
  question: IQuestion
  option: IOption
  session: string
  count: number
}
const ResultsSchema = new Schema<IResults>({
  poll: { type: Schema.ObjectId, ref: 'Poll' },
  question: { type: Schema.ObjectId, ref: 'Question' },
  option: { type: Schema.ObjectId, ref: 'Option' },
  session: Schema.Types.String,
})
ResultsSchema.index(
  { poll: 1, question: 1, session: 1 },
  { unique: true }
);
export const Results = mongoose.model('Results', ResultsSchema);
