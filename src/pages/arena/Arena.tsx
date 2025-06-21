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
  const [startFight] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleGoToLab = () => {
    navigate('/laboratory')
  }

  useEffect(() => {
    const startingFight = async () => {
      await authorizationAndInitTelegram(navigate)

      const { data }: { data: { MonsterBattle: MonsterBattles } } = await client.query({
        query: MONSTER_BATTLE,
        variables: {
          monsterBattleId: battleId,
        },
        fetchPolicy: 'no-cache',
      })

      if (data.MonsterBattle.status === 'REJECTED') {
        setInfoMessage('Бой отменён')
        setIsLoading(false)
        return
      } else if (data.MonsterBattle.status === 'FINISHED') {
        setInfoMessage('Бой завершён')
        setIsLoading(false)
        return
      }

      if (!monsterStore.selectedMonster) {
        await monsterStore.fetchMonsters()
      }

      if (data.MonsterBattle.challengerMonsterId !== monsterStore.selectedMonster?.id) {
        await monsterStore.fetchOpponentMonster(data.MonsterBattle.challengerMonsterId)
      } else {
        await monsterStore.fetchOpponentMonster(data.MonsterBattle.opponentMonsterId)
      }

      setIsLoading(false)
    }
    startingFight()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className={styles.arena}>
      <Header avatarUrl={userStore.user?.avatar?.url} />
      <main className={styles.main}>
        <div className={styles.logoPlaceholder}>{infoMessage ? `${infoMessage}` : ''}</div>

        {startFight ? <></> : <TestFight battleId={battleId} />}
        <SecondButton onClick={handleGoToLab}>Лаборатория</SecondButton>
      </main>
    </div>
  )
})

export default Arena
