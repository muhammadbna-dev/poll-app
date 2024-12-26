import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { Poll } from "@/types"
import { useGetResults } from "@/useGetResults"

// TODO: Works only for one question for now
const ResultsCard = ({ poll, }: { poll: Poll | undefined }) => {
  const result = useGetResults(poll?._id, poll?.questions[0]._id)


  return poll && result ? [poll.questions[0]].map((question) => {
    return (
      <Card className="w-[60%] p-7 flex flex-col gap-5" key={question._id} >
        <CardTitle>{question.text}</CardTitle>
        <CardContent>
          <div className="flex flex-col gap-5">
            {question.options.map((option) => {
              const optionId = option._id
              const foundResult = result?.find(((item) => optionId === item._id))
              const count = foundResult ? foundResult.count : 0
              return (
                <div key={option._id}>{option.text} = {count}</div>
              )
            })}
          </div>
        </CardContent>
      </Card >)
  }) : <></>
}

export default ResultsCard