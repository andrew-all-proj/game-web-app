import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"
import styles from "./CreateUser.module.css"
import Header from "../../components/Header/Header"
import { useMutation } from "@apollo/client";
import { USER_UPDATE } from "../../api/graphql/mutation"

const CreateUser = observer(() => {
  const [name, setName] = useState("")
  const [userUpdate] = useMutation(USER_UPDATE)
  const navigate = useNavigate()
 
  if(!userStore.user?.id){
    navigate("/")
  }

  const handleCreateUser = async () => {
    if (!name.trim()) return

    try {
      const { data } = await userUpdate({
        variables: {
          id: userStore.user?.id,
          nameProfessor: name,
          isRegistered: true
        },
      })

      if (data?.UserUpdate) {
        userStore.setUser(data.UserUpdate)
        navigate("/laboratory")
      }
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error)
    }
  }

  return (
    <div className={styles.createUser}>
      <Header />
      <main className={styles.main}>
        <div className={styles.logoWrapper}>
          <div>Создание пользователя</div>
        </div>
        <div>
          <input
            type="text"
            value={name}
            placeholder="Введите Ваше имя Профессор"
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleCreateUser}>
            Создать
          </button>
        </div>
      </main>
    </div>
  )
})


export default CreateUser
