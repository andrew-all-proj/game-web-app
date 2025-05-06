import { useEffect } from "react"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"
import { useNavigate } from "react-router-dom"

import styles from "./Laboratory.module.css"
import Header from "../../components/Header/Header"
import { authorizationAndInitTelegram } from "../../functions/authorization-and-init-telegram"
import Loading from "../loading/Loading"
import ConstructorMonster from "./ConstructorMonster"

const Laboratory = observer(() => {
  const navigate = useNavigate()

  useEffect(() => {
    authorizationAndInitTelegram(navigate);
  }, []);

  const handleGoToArena = () => {
    navigate("/arena")
  }

  if (!userStore.isAuthenticated) {
    return <Loading />
  }

  return (
    <div className={styles.laboratory}>
      <Header />
      <main className={styles.main}>
          <div className={styles.logoPlaceholder}>
           Laboratory — Привет, {userStore.user?.nameProfessor ?? "Гость"}!
          </div>

          <ConstructorMonster />

        <div className={styles.counterWrapper}>

          <button className={styles.counterButton} onClick={handleGoToArena}>
            Перейти на арену
          </button>
        </div>
      </main>
    </div>

  )
})

export default Laboratory
