import { IPoll, IResults, Poll, Results } from "./models"
import mongoose from "mongoose"

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

  async aggregateResults(pollId: string, questionId: string) {
    return await Results.aggregate([
      {
        $match: {
          poll: new mongoose.Types.ObjectId(pollId),
          question: new mongoose.Types.ObjectId(questionId)
        }
      },
      {
        $group: {
          _id: '$option',
          count: { $sum: 1 },
        }
      },
      {
        $project: {
          count: 1,
        }
      }
    ]);
  }
}