import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import userStore from '../../stores/UserStore'
import { useParams } from 'react-router-dom'

import styles from './Arena.module.css'
import Header from '../../components/Header/Header'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import TestFight from './TestFight'
import { MONSTER_BATTLE } from '../../api/graphql/query'
import client from '../../api/apolloClient'
import { MonsterBattles } from '../../types/GraphResponse'
import SecondButton from '../../components/Button/SecondButton'
import monsterStore from '../../stores/MonsterStore'

const Arena = observer(() => {
  const navigate = useNavigate()
  const { battleId } = useParams()
  const [infoMessage, setInfoMessage] = useState('')
  const [startFight, setStartFight] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const handleGoToLab = () => {
    navigate('/laboratory')
  }

  useEffect(() => {
    const startingFight = async () => {
      try {
        await authorizationAndInitTelegram(navigate)

        const { data }: { data: { MonsterBattle: MonsterBattles } } = await client.query({
          query: MONSTER_BATTLE,
          variables: { monsterBattleId: battleId },
          fetchPolicy: 'no-cache',
        })

        const battle = data.MonsterBattle

        if (battle.status === 'REJECTED') {
          setInfoMessage('Бой отменён')
          setStartFight(false)
          return setIsLoading(false)
        }

        if (battle.status === 'FINISHED') {
          setInfoMessage('Бой завершён')
          setStartFight(false)
          return setIsLoading(false)
        }

        if (!monsterStore.selectedMonster) {
          await monsterStore.fetchMonsters()
        }

        const { challengerMonsterId, opponentMonsterId } = battle

        const myMonster =
          monsterStore.monsters.find(
            (m) => m.id === challengerMonsterId || m.id === opponentMonsterId,
          ) ?? null

        if (myMonster && myMonster.id !== monsterStore.selectedMonster?.id) {
          await monsterStore.setSelectedMonster(myMonster.id)
        }

        const opponentId =
          myMonster?.id === challengerMonsterId ? opponentMonsterId : challengerMonsterId

        await monsterStore.fetchOpponentMonster(opponentId)
      } catch (error) {
        console.error('Ошибка при старте боя:', error)
        setInfoMessage('Ошибка при загрузке данных боя')
      } finally {
        setIsLoading(false)
      }
    }

    startingFight()
  }, [battleId, navigate])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className={styles.arena}>
      <Header avatarUrl={userStore.user?.avatar?.url} />
      <main className={styles.main}>
        <div className={styles.logoPlaceholder}>{infoMessage ? `${infoMessage}` : ''}</div>

        {startFight ? <TestFight battleId={battleId} /> : <></>}
        <SecondButton onClick={handleGoToLab}>Лаборатория</SecondButton>
      </main>
    </div>
  )
})

export default Arena
