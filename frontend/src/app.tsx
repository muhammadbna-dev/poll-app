import PollCard from "@/poll-card"
import ResultsCard from "@/results-card"
import { Poll } from "@/types"
import { useEffect, useState } from "react"

const POLL_ID = "6767e4fd2041d1c0c94f3da3"

const App = () => {
  const [ui, setUi] = useState<"poll" | "result">("poll")
  const [poll, setPoll] = useState<Poll>()
  const [userSession, setUserSession] = useState<string>("")

  const generateSessionId = () => {
    return (Math.random() + 1).toString(36).substring(7);
  }

  // TODO: The session ID is to simulate the "user". Ideally, there should be a user and session data to track this but this will suffice
  const checkIfUserHasSessionId = () => {
    return !!localStorage.getItem("session")
  }

  const saveOnlineUser = async () => {
    const session = generateSessionId()
    await fetch(`api/users`, {
      method: "POST",
      body: JSON.stringify({
        user: session
      })
    })
    setUserSession(session)
    return session
  }

  useEffect(() => {
    (async () => {
      let session = ""
      try {
        session = await saveOnlineUser()
        const data = await fetch(`api/poll/${POLL_ID}`)
        const json = await data.json()
        setPoll(json.data)
      } catch (err) {
        console.error(err)
      }
      const hasId = checkIfUserHasSessionId()
      hasId ? setUi("result") : setUi("poll")

      addEventListener("beforeunload", async () => {
        await fetch(`api/users`, {
          method: "DELETE",
          body: JSON.stringify({
            user: session
          })
        })
      })
      // TOOD :remove event listenr

    })()
  }, [])

  // TODO :A bit ugly
  if (poll) {
    if (ui === "result") {
      return <ResultsCard poll={poll} />
    }

    return <PollCard session={userSession} poll={poll} submit={() => setUi("result")} />
  }

  return <></>
}

export default App