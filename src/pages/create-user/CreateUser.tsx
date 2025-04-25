import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"

import styles from "./CreateUser.module.css"
import MainCharacter from "../../components/MainCharacter/MainCharacter"
import Pets from "../../components/Pets/Pets"
import Header from "../../components/Header/Header"
import { useMutation } from "@apollo/client";
import { USER_UPDATE } from "../../api/graphql/mutation"

const CreateUser = observer(() => {
  const [name, setName] = useState("")
  const [userUpdate] = useMutation(USER_UPDATE)
  const navigate = useNavigate()

  const handleCreateUser = async () => {
    if (!name.trim()) return

    try {
      const userId = userStore.user?.id

      const { data } = await userUpdate({
        variables: {
          id: userId,
          nameProfessor: name,
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
    <div className={styles.app}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoPlaceholder}>Создание пользователя</div>
        </div>

        <MainCharacter />
        <Pets />

        <div className={styles.formWrapper}>
          <input
            className={styles.nameInput}
            type="text"
            value={name}
            placeholder="Введите Ваше имя Профессор"
            onChange={(e) => setName(e.target.value)}
          />
          <button className={styles.createButton} onClick={handleCreateUser}>
            Создать
          </button>
        </div>
      </main>
    </div>
  )
})


export default CreateUser
