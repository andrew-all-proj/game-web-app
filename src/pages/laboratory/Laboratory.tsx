import { useState } from "react"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"
import { useNavigate } from "react-router-dom"

import styles from "./Laboratory.module.css"
import MainCharacter from "../../components/MainCharacter"
import BottomMenu from "../../components/BottomMenu"
import Pets from "../../components/Pets"
import Header from "../../components/Header"

const Laboratory = observer(() => {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

  const handleGoToArena = () => {
    navigate("/arena")
  }

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.mainContent}>

        <div className={styles.logoWrapper}>
          <div className={styles.logoPlaceholder}>
           Ваша лаборатория, профессор {userStore.user?.nameProfessor ?? "Гость"}!
          </div>
        </div>

        <MainCharacter />
        <Pets />

        <div className={styles.counterWrapper}>
          <button className={styles.counterButton} onClick={() => setCount((c) => c + 1)}>
            count is {count}
          </button>
          <button className={styles.counterButton} onClick={handleGoToArena}>
            Перейти на арену
          </button>
        </div>
      </main>

      <BottomMenu />
    </div>
  )
})

export default Laboratory
