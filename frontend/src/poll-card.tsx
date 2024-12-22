import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { Poll } from "@/types"

const PollCard = ({ poll, submit }: { poll: Poll | undefined, submit: () => void }) => {
  const generateSessionId = () => {
    // const random = "foo"
    const random = (Math.random() + 1).toString(36).substring(7);
    return random
  }


  const postResponse = async (questionId: string, optionId: string) => {
    const sessionId = generateSessionId()
    await fetch(`api/result`, {
      method: "POST",
      body: JSON.stringify({
        poll: poll?._id,
        question: questionId,
        option: optionId,
        session: generateSessionId()
      })
    })
    localStorage.setItem("session", sessionId)
    submit()
  };

  return poll ? poll.questions.map((question) => {
    return (
      <Card className="w-[60%] p-7 flex flex-col gap-5" key={question._id} >
        <CardTitle>{question.text}</CardTitle>
        <CardContent>
          <div className="flex flex-col gap-5">
            {question.options.map((option) => {
              return (
                <Button variant="secondary" key={option._id} onClick={() => postResponse(question._id, option._id)}>{option.text}</Button>
              )
            })}
          </div>
        </CardContent>
      </Card >)
  }) : <></>
}

export default PollCard