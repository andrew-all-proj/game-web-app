import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import styles from './SearchBattle.module.css'
import monsterStore from '../../stores/MonsterStore'
import userStore from '../../stores/UserStore'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import { useNavigate } from 'react-router-dom'
import Loading from '../loading/Loading'
import MainButton from '../../components/Button/MainButton'
import { connectSocket, disconnectSocket } from '../../api/socket'
import SecondButton from '../../components/Button/SecondButton'
import DuelRequestModal from './DuelRequestModal'
import { GraphQLListResponse, MonsterBattles } from '../../types/GraphResponse'
import { MONSTER_BATTLES } from '../../api/graphql/query'
import client from '../../api/apolloClient'

interface monsterOpponent {
  monsterId: string
  socketId: string
  findOpponent: boolean
  name: string
  level: number
  avatar: string | null
}

const SearchBattle = observer(() => {
  const [opponents, setOpponents] = useState<monsterOpponent[]>([])
  const [registeredMonster, setRegisteredMonster] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [waitOpponentMessage, setWaitOpponentMessage] = useState('')
  const [waitOpponent, setWaitOpponent] = useState(true)
  const [requestBattleOpponent, setRequestbattleOpponent] = useState<monsterOpponent | null>(null)
  const [cursor, setCursor] = useState('0')
  const [nextCursor, setNextCursor] = useState('0')
  const navigate = useNavigate()

  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null)

  useEffect(() => {
    const fetchOpponents = async () => {
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

      if (!userStore.user?.token) return

      const socket = connectSocket(userStore.user.token, () => {
        socketRef.current = socket

        socket.on('opponents', (data) => {
          setOpponents(data.opponents)
          setNextCursor(data.nextCursor)
          setIsLoading(false)
        })

        socket.on('registerMonster', (data) => {
          setRegisteredMonster(data.result)
        })

        socket.on('duelChallengeResponce', (data) => {
          if (!data.result) {
            setWaitOpponent(true)
            setWaitOpponentMessage('Противник отказался')
          } else {
            socketRef.current?.emit('registerMonsterForBattle', {
              isFindOpponent: false,
              monsterId: monsterStore.selectedMonster?.id,
            })
            navigate(`/arena/${data.battleId}`)
          }
        })

        socket.on('duelChallengeRequest', (opponent) => {
          setRequestbattleOpponent(opponent)
        })

        socket.emit('registerMonsterForBattle', {
          isFindOpponent: true,
          monsterId: monsterStore.selectedMonster?.id,
        })

        socket.emit('getOpponents', {
          findOpponent: true,
          monsterId: monsterStore.selectedMonster?.id,
          cursor,
          limit: 5,
        })
      })
    }

    fetchOpponents()

    return () => {
      disconnectSocket()
    }
  }, [navigate, cursor])

  if (isLoading) {
    return <Loading />
  }

  const handleChallenge = (monster: monsterOpponent) => {
    if (!waitOpponent) return

    setWaitOpponentMessage('Ждите, когда противник примет ваш вызов на дуэль...')
    setWaitOpponent(false)

    socketRef.current?.emit('requestDuelChallenge', {
      fromMonsterId: monsterStore.selectedMonster?.id,
      toMonsterId: monster.monsterId,
    })

    setTimeout(() => {
      setWaitOpponent(true)
      setWaitOpponentMessage('')
    }, 30000)
  }

  const handleGoToLab = () => {
    socketRef.current?.emit('registerMonsterForBattle', {
      isFindOpponent: false,
      monsterId: monsterStore.selectedMonster?.id,
    })
    navigate('/laboratory')
  }

  const handleUpdateSerch = () => {
    setIsLoading(true)
    socketRef.current?.emit('getOpponents', {
      findOpponent: true,
      monsterId: monsterStore.selectedMonster?.id,
      cursor,
      limit: 5,
    })
  }

  const handleDuelAccepted = (requestbattleOpponent: monsterOpponent) => {
    socketRef.current?.emit('duelAccepted', {
      duelAccepted: true,
      fromMonsterId: requestbattleOpponent.monsterId,
      toMonsterId: monsterStore.selectedMonster?.id,
    })
    setRequestbattleOpponent(null)
    socketRef.current?.emit('registerMonsterForBattle', {
      isFindOpponent: false,
      monsterId: monsterStore.selectedMonster?.id,
    })
  }

  const handleDuelDecline = (requestbattleOpponent: monsterOpponent) => {
    socketRef.current?.emit('duelAccepted', {
      duelAccepted: false,
      fromMonsterId: requestbattleOpponent.monsterId,
      toMonsterId: monsterStore.selectedMonster?.id,
    })
    setRequestbattleOpponent(null)
  }

  console.log(registeredMonster)

  return (
    <>
      {requestBattleOpponent && (
        <DuelRequestModal
          opponent={requestBattleOpponent}
          onAccept={() => {
            handleDuelAccepted(requestBattleOpponent)
          }}
          onDecline={() => {
            handleDuelDecline(requestBattleOpponent)
          }}
        />
      )}
      <div className={styles.searchBattle}>
        {monsterStore.selectedMonster && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            {monsterStore.selectedMonster.avatar ? (
              <img
                src={monsterStore.selectedMonster.avatar}
                alt="Ваш монстр"
                width={60}
                height={60}
                style={{ borderRadius: '50%', marginRight: '10px' }}
              />
            ) : (
              <div
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: '#ddd',
                  borderRadius: '50%',
                  marginRight: '10px',
                }}
              />
            )}
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {monsterStore.selectedMonster.name}
            </span>
          </div>
        )}

        <h2>Поиск противника</h2>

        {waitOpponentMessage ? <div>{waitOpponentMessage}</div> : <div></div>}

        {opponents.length === 0 ? (
          <div>Нет доступных противников</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Аватар</th>
                  <th>Имя</th>
                  <th>Уровень</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {opponents.map((monster) => (
                  <tr key={monster.monsterId}>
                    <td>
                      {monster.avatar ? (
                        <img
                          src={monster.avatar}
                          alt="avatar"
                          width={50}
                          height={50}
                          style={{ borderRadius: '50%' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            backgroundColor: '#eee',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                    </td>
                    <td>{monster.name}</td>
                    <td>{monster.level}</td>
                    <td>
                      <button onClick={() => handleChallenge(monster)}>Вызвать на дуэль</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <button onClick={() => {}} disabled={cursor === '0'}>
                Назад
              </button>
              <span>Текущая страница</span>
              <button
                onClick={() => {
                  setIsLoading(true)
                  setCursor(nextCursor)
                  socketRef.current?.emit('getOpponents', {
                    monsterId: monsterStore.selectedMonster?.id,
                    cursor: nextCursor,
                    limit: 5,
                  })
                }}
                disabled={nextCursor === '0'}
              >
                Вперёд
              </button>
            </div>
          </>
        )}
        <SecondButton onClick={handleUpdateSerch}>Обновить</SecondButton>
        <MainButton onClick={handleGoToLab}>Лаборатория</MainButton>
      </div>
    </>
  )
})

export default SearchBattle
