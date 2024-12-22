import PollCard from "@/poll-card"
import ResultsCard from "@/results-card"
import { Poll } from "@/types"
import { useEffect, useState } from "react"

const POLL_ID = "6767e4fd2041d1c0c94f3da3"

const App = () => {
  const [ui, setUi] = useState<"poll" | "result">("poll")
  const [poll, setPoll] = useState<Poll>()

  // TODO: The session ID is to simulate the "user". Ideally, there should be a user and session data to track this but this will suffice
  const checkIfUserHasSessionId = () => {
    return !!localStorage.getItem("session")
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await fetch(`api/poll/${POLL_ID}`)
        const json = await data.json()
        setPoll(json.data)
      } catch (err) {
        console.error(err)
      }
      const hasId = checkIfUserHasSessionId()
      hasId ? setUi("result") : setUi("poll")
    })()
  }, [])


  if (ui === "result") {
    return <ResultsCard poll={poll} />
  }

  return <PollCard poll={poll} submit={() => setUi("result")} />
}

export default App