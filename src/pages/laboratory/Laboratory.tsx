import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"
import { useNavigate } from "react-router-dom"

import styles from "./Laboratory.module.css"
import MainCharacter from "../../components/MainCharacter"
import BottomMenu from "../../components/BottomMenu"
import Pets from "../../components/Pets"
import Header from "../../components/Header"
import { initTelegram } from "../../functions/init-telegram"
import client from "../../api/apolloClient"
import Loading from "../loading/Loading"

const Laboratory = observer(() => {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()
  const [isInitChecked, setIsInitChecked] = useState(false);

  useEffect(() => {
    const runInitTelegram = async () => {
      if (!userStore.isAuthenticated) {
        const initTlg = await initTelegram(client);
        if (!initTlg) {
          navigate("/error");
          return;
        }
      }
      setIsInitChecked(true);
    };

    runInitTelegram();
  }, []);

  const handleGoToArena = () => {
    navigate("/arena")
  }

  if (!userStore.isAuthenticated && !isInitChecked) {
    return <Loading />
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
