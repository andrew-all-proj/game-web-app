import { useEffect, useState } from "react"
import Loading from "../pages/loading/Loading"
import Arena from "../pages/arena/Arena"

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) 

    return () => clearTimeout(timer)
  }, [])

  return isLoading ? <Loading /> : <Arena />
}

export default App
