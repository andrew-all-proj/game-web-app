import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"

import styles from "./Arena.module.css"
import MainCharacter from "../../components/MainCharacter"
import BottomMenu from "../../components/BottomMenu"
import Pets from "../../components/Pets"
import Header from "../../components/Header"

const Arena = observer(() => {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

  const handleGoToLab = () => {
    navigate("/laboratory")
  }

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.mainContent}>
        {/* ARENA */}
        <div className={styles.logoWrapper}>
          <div className={styles.logoPlaceholder}>
            ARENA — Привет, {userStore.user?.nameProfessor ?? "Гость"}!
          </div>
        </div>

        <MainCharacter />
        <Pets />

        <div className={styles.counterWrapper}>
          <button className={styles.counterButton} onClick={() => setCount((c) => c + 1)}>
            count is {count}
          </button>

          <button className={styles.counterButton} onClick={handleGoToLab}>
            Перейти в лабораторию
          </button>
        </div>
      </main>

      <BottomMenu />
    </div>
  )
})

export default Arena
