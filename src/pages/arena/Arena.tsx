import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"

import styles from "./Arena.module.css"
import MainCharacter from "../../components/MainCharacter"
import BottomMenu from "../../components/BottomMenu"
import Pets from "../../components/Pets"
import Header from "../../components/Header"
import { initTelegram } from "../../functions/init-telegram"
import client from "../../api/apolloClient"
import Loading from "../loading/Loading"

const Arena = observer(() => {
  const [isInitChecked, setIsInitChecked] = useState(false);
  const navigate = useNavigate();

  const handleGoToLab = () => {
    navigate("/laboratory");
  };

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

  if (!userStore.isAuthenticated && !isInitChecked) {
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

      <BottomMenu />
    </div>
  );
});


export default Arena
