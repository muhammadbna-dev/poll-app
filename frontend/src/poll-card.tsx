import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Poll } from "@/types"
import { useGetResults } from "@/useGetResults"
import { useOnlineUsersCount } from "@/useOnlineUserCount"

const PollCard = ({ poll, submit, session }: { session: string, poll: Poll | undefined, submit: () => void }) => {
  const result = useGetResults(poll?._id, poll?.questions[0]._id)
  const userCount = useOnlineUsersCount()

  const postResponse = async (questionId: string, optionId: string) => {
    await fetch(`api/result`, {
      method: "POST",
      body: JSON.stringify({
        poll: poll?._id,
        question: questionId,
        option: optionId,
        session: session
      })
    })
    localStorage.setItem("session", session)
    submit()
  };

  return poll ? poll.questions.map((question) => {
    return (
      <Card className="w-[60%] p-7 flex flex-col gap-5" key={question._id} >
        <CardTitle>{question.text}</CardTitle>
        <CardDescription>{`User count: ${userCount}`}</CardDescription>
        <CardContent>
          <div className="flex flex-col gap-5">
            {question.options.map((option) => {
              const optionId = option._id
              const foundResult = result?.find(((item) => optionId === item._id))
              const count = foundResult ? foundResult.count : 0
              return (
                <Button variant="secondary" key={option._id} onClick={() => postResponse(question._id, option._id)}>{`${option.text} : ${count}`}</Button>
              )
            })}
          </div>
        </CardContent>
      </Card >)
  }) : <></>
}

export default PollCard