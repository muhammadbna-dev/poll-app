import { IPoll, IResults, Poll, Results } from "./models"
import mongoose, { ObjectId } from "mongoose"

export class PollRepository {

  async create(data: IPoll) {
    const poll = new Poll(data)
    return await poll.save()
  }

  async getAll() {
    return Poll.find()
  }

  async getById(id: string) {
    return Poll.findById(id)
  }
}

export class ResultRepository {
  // TODO: Makes more sense to have a unique constraint for pollId, questionId and sessionId such that once the user polls on a question, they cannot poll again
  async create(data: IResults) {
    const result = new Results(data)
    return await result.save()
  }

  async aggregateResults(pollId: string) {
    const questionOptions = await Results.aggregate([
      {
        $group: {
          _id: "$question",
          options: { $push: "$option" }
        }
      }
    ]);

    const returnVal: { [questionId: string]: { [optionId: string]: number } } = {}
    for (const item of questionOptions) {
      const questionId = item._id.toString();
      const options = item.options;

      const optionCounts = options.reduce((prev: { [optionId: string]: number }, curr: ObjectId) => {
        const optionId = curr.toString();
        if (!prev?.[optionId]) {
          prev[optionId] = 0
        }
        prev[optionId]++
        return prev
      }, {});

      returnVal[questionId] = optionCounts
    }

    return returnVal
  }

  async getAnsweredQuestions(pollId: string, session: string) {
    const results = await Results.find({
      poll: new mongoose.Types.ObjectId(pollId),
      session,
    })
    return results.map(({ question }) => question)
  }
}