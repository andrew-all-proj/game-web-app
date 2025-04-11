import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"

import styles from "./CreateUser.module.css"
import MainCharacter from "../../components/MainCharacter"
import BottomMenu from "../../components/BottomMenu"
import Pets from "../../components/Pets"
import Header from "../../components/Header"

const CreateUser = observer(() => {
  const [name, setName] = useState("")
  const navigate = useNavigate()

  const handleCreateUser = () => {
    if (name.trim()) {
      userStore.setUser({ id: "123", name }) 
      navigate("/laboratory")
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
            placeholder="Введите имя"
            onChange={(e) => setName(e.target.value)}
          />
          <button className={styles.createButton} onClick={handleCreateUser}>
            Создать
          </button>
        </div>
      </main>

      <BottomMenu />
    </div>
  )
})

export default CreateUser
