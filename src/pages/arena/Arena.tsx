import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"

import styles from "./Arena.module.css"
import Header from "../../components/Header/Header"
import { authorizationAndInitTelegram } from "../../functions/authorization-and-init-telegram"
import Loading from "../loading/Loading"
import AnimatedMonster from "./TestFight"

const Arena = observer(() => {
  const navigate = useNavigate();

  const handleGoToLab = () => {
    navigate("/laboratory");
  };

  useEffect(() => {
    authorizationAndInitTelegram(navigate);
  }, []);

  if (!userStore.isAuthenticated) {
    return <Loading />
  }

  return (
    <div className={styles.arena}>
      <Header />
      <main className={styles.main}>
          <div className={styles.logoPlaceholder}>
            ARENA — Привет, {userStore.user?.nameProfessor ?? "Гость"}!
          </div>

        <AnimatedMonster />

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
