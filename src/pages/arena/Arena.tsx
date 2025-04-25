import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"

import styles from "./Arena.module.css"
import MainCharacter from "../../components/MainCharacter/MainCharacter"
import Pets from "../../components/Pets/Pets"
import Header from "../../components/Header/Header"
import { initTelegram } from "../../functions/init-telegram"
import Loading from "../loading/Loading"

const Arena = observer(() => {
  const navigate = useNavigate();

  const handleGoToLab = () => {
    navigate("/laboratory");
  };

  useEffect(() => {
    const runInitTelegram = async () => {
      if (!userStore.isAuthenticated) {
        const initTlg = await initTelegram();
        if (!initTlg) {
          navigate("/error");
          return;
        }
      }
    };

    runInitTelegram();
  }, []);

  if (!userStore.isAuthenticated) {
    return <Loading />
  }

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoPlaceholder}>
            ARENA — Привет, {userStore.user?.nameProfessor ?? "Гость"}!
          </div>
        </div>

        <MainCharacter />
        <Pets />

        <div className={styles.counterWrapper}>

          <button className={styles.counterButton} onClick={handleGoToLab}>
            Перейти в лабораторию
          </button>
        </div>
      </main>
    </div>
  );
});


export default Arena
