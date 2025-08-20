import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import styles from './SearchBattle.module.css'
import monsterStore from '../../stores/MonsterStore'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import { useNavigate } from 'react-router-dom'
import Loading from '../loading/Loading'
import MainButton from '../../components/Button/MainButton'
import { getSocket } from '../../api/socket'
import { GraphQLListResponse, MonsterBattles } from '../../types/GraphResponse'
import { MONSTER_BATTLES } from '../../api/graphql/query'
import client from '../../api/apolloClient'
import { useSocketEvent } from '../../functions/useSocketEvent'
import HeaderBar from '../../components/Header/HeaderBar'
import OpponentList from './OpponentList'
import { MonsterOpponent } from '../../types/BattleRedis'
import DuelInvites from './DuelInvites'
import SimpleBar from 'simplebar-react'
import { showTopAlert } from '../../components/TopAlert/topAlertBus'

interface DuelChallengeResponsePayload {
  result: boolean
  battleId?: string
}

interface OpponentsResponsePayload {
  opponents: MonsterOpponent[]
  nextCursor: string
}

const SearchBattle = observer(() => {
  const [opponents, setOpponents] = useState<MonsterOpponent[]>([])
  const [registeredMonster, setRegisteredMonster] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [waitOpponent, setWaitOpponent] = useState(true)
  const [duelInvites, setDuelInvites] = useState<MonsterOpponent[]>([])
  // const [cursor, setCursor] = useState('0')
  // const [nextCursor, setNextCursor] = useState('0')
  const navigate = useNavigate()

  useEffect(() => {
    const initSearch = async () => {
      const success = await authorizationAndInitTelegram(navigate)
      if (!success) return

      const { data }: { data: { MonsterBattles: GraphQLListResponse<MonsterBattles> } } =
        await client.query({
          query: MONSTER_BATTLES,
          variables: {
            limit: 10,
            offset: 0,
            status: {
              in: ['PENDING', 'ACCEPTED'],
            },
          },
          fetchPolicy: 'no-cache',
        })

      const activeBattle = data.MonsterBattles?.items?.find(
        (battle) => battle.status && ['PENDING', 'ACCEPTED'].includes(battle.status),
      )

      if (activeBattle) {
        navigate(`/arena/${activeBattle.id}`)
        return
      }

      if (monsterStore.selectedMonster === null) {
        await monsterStore.fetchMonsters()
      }
      const socket = getSocket()

      if (!socket) return

      socket.emit('registerMonsterForBattle', {
        isFindOpponent: true,
        monsterId: monsterStore.selectedMonster?.id,
      })
      socket.emit('getOpponents', {
        findOpponent: true,
        monsterId: monsterStore.selectedMonster?.id,
        cursor: '0',
        limit: 5,
      })
    }

    initSearch()
  }, [navigate])

  useSocketEvent<OpponentsResponsePayload>('opponents', (data) => {
    setOpponents(data.opponents)
    //setNextCursor(data.nextCursor)
    setIsLoading(false)
  })

  useSocketEvent<DuelChallengeResponsePayload>('duelChallengeResponce', (data) => {
    if (!data.result) {
      showTopAlert({open: true, text: "Недостаточно энергии или голоден монстр", variant: 'warning'})
      setWaitOpponent(true)
    } else {
      getSocket()?.emit('registerMonsterForBattle', {
        isFindOpponent: false,
        monsterId: monsterStore.selectedMonster?.id,
      })
      navigate(`/arena/${data.battleId}`)
    }
  })

  useSocketEvent<MonsterOpponent>('duelChallengeRequest', (data) => {
    setDuelInvites((prev) => {
      if (prev.find((o) => o.monsterId === data.monsterId)) return prev
      return [...prev, data]
    })
  })

  useSocketEvent<{ result: boolean }>('registerMonster', (data) => {
    setRegisteredMonster(data.result)
  })

  if (isLoading && registeredMonster) {
    return <Loading />
  }

  const handleChallenge = (monster: MonsterOpponent) => {
    if (!waitOpponent) return

    getSocket()?.emit('requestDuelChallenge', {
      fromMonsterId: monsterStore.selectedMonster?.id,
      toMonsterId: monster.monsterId,
    })

    setTimeout(() => {
      setWaitOpponent(true)
    }, 15000)
  }

  const handleGoToLab = () => {
    getSocket()?.emit('registerMonsterForBattle', {
      isFindOpponent: false,
      monsterId: monsterStore.selectedMonster?.id,
    })
    navigate('/laboratory')
  }

  useEffect(() => {
    const updateOpponents = () => {
      getSocket()?.emit('getOpponents', {
        findOpponent: true,
        monsterId: monsterStore.selectedMonster?.id,
        cursor: '0',
        limit: 5,
      })
    }

    updateOpponents()

    const intervalId = setInterval(updateOpponents, 10000)
    return () => clearInterval(intervalId)
  }, [monsterStore.selectedMonster?.id])

  const handleDuelAccepted = (opponent: MonsterOpponent) => {
    getSocket()?.emit('duelAccepted', {
      duelAccepted: true,
      fromMonsterId: opponent.monsterId,
      toMonsterId: monsterStore.selectedMonster?.id,
    })
    setDuelInvites((prev) => prev.filter((o) => o.monsterId !== opponent.monsterId))
    getSocket()?.emit('registerMonsterForBattle', {
      isFindOpponent: false,
      monsterId: monsterStore.selectedMonster?.id,
    })
  }

  const handleDuelDecline = (opponent: MonsterOpponent) => {
    getSocket()?.emit('duelAccepted', {
      duelAccepted: false,
      fromMonsterId: opponent.monsterId,
      toMonsterId: monsterStore.selectedMonster?.id,
    })
    setDuelInvites((prev) => prev.filter((o) => o.monsterId !== opponent.monsterId))
  }

  // const handleNext = () => {
  //   setIsLoading(true)
  //   setCursor(nextCursor)
  //   getSocket()?.emit('getOpponents', {
  //     monsterId: monsterStore.selectedMonster?.id,
  //     cursor: nextCursor,
  //     limit: 5,
  //   })
  // }

  // const handlePrev = () => {
  //   // Реализуй если нужен функционал назад, сейчас как пример:
  //   // setIsLoading(true)
  //   // setCursor(prevCursor)
  //   // getSocket()?.emit('getOpponents', { ... })
  // }

  return (
    <div className={styles.searchBattle}>
      <HeaderBar title="Выбрать противника" />
      <div className={styles.content}>
        {opponents.length === 0 ? (
          <div>Нет доступных противников</div>
        ) : (
          <SimpleBar className={styles.scrollArea}>
            <OpponentList opponents={opponents} onChallenge={handleChallenge} />
          </SimpleBar>
        )}
        <div className={styles.duelInvitesWrapper}>
          <SimpleBar className={styles.scrollArea}>
            <DuelInvites
              invites={duelInvites}
              onAccept={handleDuelAccepted}
              onDecline={handleDuelDecline}
            />
          </SimpleBar>
        </div>
      </div>
      <div className={styles.bottomMenu}>
        <MainButton onClick={handleGoToLab}>Лаборатория</MainButton>
      </div>
    </div>
  )
})

export default SearchBattle
