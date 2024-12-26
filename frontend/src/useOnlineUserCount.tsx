import { useEffect, useState } from "react"
import { Result } from "@/types"


export const useOnlineUsersCount = () => {
  const [count, setCount] = useState<Result>()

  const getUserCount = async () => {
    const data = await fetch(`api/users`)
    const json = await data.json()
    setCount(json.data)
  }

  useEffect(() => {
    getUserCount()
    let intervalId = setInterval(getUserCount, 1000);
    return () => clearInterval(intervalId)
  }, [])

  return count
}
