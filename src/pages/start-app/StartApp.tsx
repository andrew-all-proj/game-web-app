import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"
import Loading from "../loading/Loading"

const StartApp = observer(() => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userStore.isAuthenticated) {
        navigate("/arena")
      } else {
        navigate("/create-user")
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return <Loading />
})

export default StartApp
