import { useEffect, useState } from "react"
import { Result } from "@/types"


export const useGetResults = (pollId: string | undefined, questionId: string | undefined) => {
  const [result, setResult] = useState<Result>()

  const getResults = async () => {
    const data = await fetch(`api/result/generate`, {
      method: "POST",
      body: JSON.stringify({
        pollId,
        questionId,
      })
    })
    const json = await data.json()
    setResult(json.data)

  }

  useEffect(() => {
    getResults()
    let intervalId = setInterval(getResults, 1000);
    return () => clearInterval(intervalId)
  }, [])

  return result
}
