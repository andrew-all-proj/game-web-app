import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'

import styles from './Arena.module.css'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import TestFight from './TestFight'
import { MONSTER_BATTLE } from '../../api/graphql/query'
import client from '../../api/apolloClient'
import { FileItem, Monster, MonsterBattles } from '../../types/GraphResponse'
import SecondButton from '../../components/Button/SecondButton'
import monsterStore from '../../stores/MonsterStore'
import { SpriteAtlas } from '../../types/sprites'
import errorStore from '../../stores/ErrorStore'
import { GetBattleReward } from '../../types/BattleRedis'
import ResultBattle from '../result-battle/ResultBattle'

const getSprite = async (
  monster?: Monster | null,
): Promise<{ atlasFile: FileItem | null; spriteFile: FileItem | null }> => {
  if (!monster) return { atlasFile: null, spriteFile: null }

  const atlasFile =
    monster.files?.find((f) => f.fileType === 'JSON' && f.contentType === 'SPRITE_SHEET_MONSTER') ??
    null

  const spriteFile =
    monster.files?.find(
      (f) => f.fileType === 'IMAGE' && f.contentType === 'SPRITE_SHEET_MONSTER',
    ) ?? null

  return { atlasFile, spriteFile }
}

const Arena = observer(() => {
  const navigate = useNavigate()
  const { battleId } = useParams()
  //const [infoMessage, setInfoMessage] = useState('')
  const [startFight, setStartFight] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [atlas, setAtlas] = useState<SpriteAtlas | null>(null)
  const [atlasOpponent, setAtlasOpponent] = useState<SpriteAtlas | null>(null)
  const [spriteUrl, setSpriteUrl] = useState<string>('')
  const [spriteUrlOpponent, setSpriteUrlOpponent] = useState<string>('')
  const [battleResult, setBattleResult] = useState<{
    win: boolean
    reward: GetBattleReward | null
  } | null>(null)

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
          //setInfoMessage('Бой отменён')
          setStartFight(false)
          return setIsLoading(false)
        }

        if (battle.status === 'FINISHED') {
          //setInfoMessage('Бой завершён')
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
          monsterStore.setSelectedMonster(myMonster.id)
        }

        const opponentId =
          myMonster?.id === challengerMonsterId ? opponentMonsterId : challengerMonsterId

        await monsterStore.fetchOpponentMonster(opponentId)

        const { atlasFile, spriteFile } = await getSprite(monsterStore.selectedMonster)
        if (atlasFile && spriteFile) {
          const atlasJson = await fetch(atlasFile.url).then((res) => res.json())
          setAtlas(atlasJson)
          setSpriteUrl(spriteFile.url)
        } else {
          errorStore.setError({ error: true, message: 'Ошибка загрузки спрайтов' })
          navigate('/error')
        }

        const { atlasFile: opponentAtlasFile, spriteFile: opponentSpriteFile } = await getSprite(
          monsterStore.opponentMonster,
        )
        if (opponentAtlasFile && opponentSpriteFile) {
          const atlasJson = await fetch(opponentAtlasFile.url).then((res) => res.json())
          setAtlasOpponent(atlasJson)
          setSpriteUrlOpponent(opponentSpriteFile.url)
        } else {
          errorStore.setError({ error: true, message: 'Ошибка загрузки спрайтов соперника' })
          navigate('/error')
        }
      } catch (error) {
        console.error('Ошибка при старте боя:', error)
        //setInfoMessage('Ошибка при загрузке данных боя')
      } finally {
        setIsLoading(false)
      }
    }

    startingFight()
  }, [battleId, navigate])

  if (isLoading) {
    return <Loading />
  }

  if (battleResult) {
    return <ResultBattle win={battleResult.win} battleReward={battleResult.reward} />
  }

  return (
    <main className={styles.arena}>
      {startFight && atlas && atlasOpponent && battleId ? (
        <TestFight
          battleId={battleId}
          atlas={atlas}
          atlasOpponent={atlasOpponent}
          spriteUrl={spriteUrl}
          spriteUrlOpponent={spriteUrlOpponent}
          setBattleResult={setBattleResult}
        />
      ) : null}
    </main>
  )
})

export default Arena
