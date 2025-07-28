import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import styles from './MutagensMenu.module.css'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import { USER_INVENTORY } from '../../api/graphql/query'
import client from '../../api/apolloClient'
import { GraphQLListResponse, UserInventory } from '../../types/GraphResponse'
import { UserInventoryTypeEnum } from '../../types/enums/UserInventoryTypeEnum'
import mutagenIcon from '../../assets/icon/icon_mutagen.svg'
import MainButton from '../../components/Button/MainButton'
import RoundButton from '../../components/Button/RoundButton'
import MutagenGrid from './MutagenGrid'

const MutagensMenu = observer(() => {
  const navigate = useNavigate()
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [userInventories, setUserInventories] = useState<UserInventory[]>([])

  const fetchInventoriesAndMonsters = useCallback(
    async (withLoading: boolean) => {
      try {
        if (withLoading) setIsLoading(true)
        await authorizationAndInitTelegram(navigate)

        const { data }: { data: { UserInventories: GraphQLListResponse<UserInventory> } } =
          await client.query({
            query: USER_INVENTORY,
            variables: { limit: 10, offset: 0, type: { eq: UserInventoryTypeEnum.MUTAGEN } },
            fetchPolicy: 'no-cache',
          })

        setUserInventories(data.UserInventories.items)
        setIsLoading(false)
      } catch {
        setInfoMessage('Ошибка при загрузке')
        setIsLoading(false)
      }
    },
    [navigate],
  )

  useEffect(() => {
    fetchInventoriesAndMonsters(true)
  }, [navigate, fetchInventoriesAndMonsters])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className={styles.mutagensMenu}>
      <div className={styles.header}>
        <img className={styles.headerIcon} alt="mutagen" src={mutagenIcon} />
        <div className={styles.headerTextBlock}>
          <span>Мутагены</span>
        </div>
        <div className={styles.headerButton}>
          <RoundButton type="exit" onClick={() => navigate('/laboratory')} />
        </div>
      </div>
      <div className={styles.content}>
        {infoMessage}
        <div className={styles.gridWrapper}>
          <MutagenGrid userInventories={userInventories} />
        </div>
      <div className={styles.bottomMenu}>
        <MainButton
          onClick={() => navigate('/laboratory')}
          height={93}
          backgroundColor="#FB6B6B"
        >
          Утилизировать
        </MainButton>
      </div>
      </div>
    </div>
  )
})

export default MutagensMenu
