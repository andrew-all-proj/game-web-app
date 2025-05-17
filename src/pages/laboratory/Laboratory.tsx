import { useEffect } from "react"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"
import { useNavigate } from "react-router-dom"

import styles from "./Laboratory.module.css"
import Header from "../../components/Header/Header"
import { authorizationAndInitTelegram } from "../../functions/authorization-and-init-telegram"
import Loading from "../loading/Loading"
import monsterStore from "../../stores/MonsterStore"
import noAvatarMonster from '../../assets/images/no-avatar-monster.jpg'

const Laboratory = observer(() => {
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      const success = await authorizationAndInitTelegram(navigate);
      if (success && userStore.user?.id) {
        await monsterStore.fetchMonsters(userStore.user?.id)
      }
    })();
  }, []);

  const handleGoToArena = () => {
    navigate("/arena")
  }

  if (!userStore.isAuthenticated) {
    return <Loading />
  }

  return (
    <div className={styles.laboratory}>
      <Header avatarUrl={userStore.user?.avatar?.url} />
      <main className={styles.main}>
        <div className={styles.logoPlaceholder}>
           Laboratory — Привет, {userStore.user?.nameProfessor ?? "Гость"}!
        </div>
        <div>
          Ваши питомцы:
        </div>
        <div className={styles.petsList}>
          {monsterStore.monsters.map((monster) => (
            <div key={monster.id} className={styles.petCard}>
              <img src={monster.files?.find((file) => file.contentType === "AVATAR_MONSTER")?.url || noAvatarMonster} alt={monster.name} className={styles.petImage} />
              <div>{monster.name}</div>
            </div>
          ))}

          <div className={`${styles.petCard} ${styles.createPetCard}`} onClick={() => navigate("/create-pet")}>
            ➕ Создать питомца
          </div>
        </div>
        <button className={styles.counterButton} onClick={handleGoToArena}>
          Перейти на арену
        </button>
      </main>
    </div>

  )
})

export default Laboratory
