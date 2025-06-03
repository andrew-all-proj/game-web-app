import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"
import { useNavigate } from "react-router-dom"

import styles from "./Laboratory.module.css"
import Header from "../../components/Header/Header"
import { authorizationAndInitTelegram } from "../../functions/authorization-and-init-telegram"
import Loading from "../loading/Loading"
import monsterStore, { Monster } from "../../stores/MonsterStore"
import noAvatarMonster from '../../assets/images/no-avatar-monster.jpg'
import MainButton from "../../components/Button/MainButton"

const Laboratory = observer(() => {
  const navigate = useNavigate()
    const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      const success = await authorizationAndInitTelegram(navigate);
      if (success && userStore.user?.id) {
        await monsterStore.fetchMonsters(userStore.user.id);
        if (!monsterStore.selectedMonster && monsterStore.monsters.length > 0) {
          monsterStore.setSelectedMonster(monsterStore.monsters[0].id);
        }
      }
    })();
  }, []);

  const handleGoToArena = () => {
    if(!monsterStore.selectedMonster) {
      setErrorMsg('Выберите питомца')
      return
    }
    navigate("/arena")
  }

  const handleSelectMonster = (monster: Monster) => {
    monsterStore.setSelectedMonster(monster.id)
  }

  if (!userStore.isAuthenticated) {
    return <Loading />
  }

  return (
    <div className={styles.laboratory}>
      <Header avatarUrl={userStore.user?.avatar?.url} />
      <main className={styles.main}>
        <div className={styles.logoPlaceholder}>
          Профессор {userStore.user?.nameProfessor}, Ваша Лаборатория!
        </div>
        <div style={{ color: 'red' }}>
          {errorMsg}
        </div>
        <div>
          Ваши питомцы:
        </div>
        <div className={styles.petsList}>
            {monsterStore.monsters.map((monster) => (
              <div
                key={monster.id}
                className={`${styles.petCard} ${monsterStore.selectedMonster?.id === monster.id ? styles.selectedCard : ''}`}
                onClick={() => handleSelectMonster(monster)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={
                    monster.files?.find((file) => file.contentType === "AVATAR_MONSTER")?.url || noAvatarMonster
                  }
                  alt={monster.name}
                  className={styles.petImage}
                />
                <div>{monster.name}</div>
              </div>
            ))}

            <div
              className={`${styles.petCard} ${styles.createPetCard}`}
              onClick={() => navigate("/create-monster")}
            >
              ➕ Создать питомца
            </div>
          </div>

        <MainButton onClick={handleGoToArena}>Арена</MainButton>
      </main>
    </div>

  )
})

export default Laboratory
