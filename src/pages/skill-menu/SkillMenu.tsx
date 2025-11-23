import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import styles from './SkillMenu.module.css'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import client from '../../api/apolloClient'
import upgradeIcon from '../../assets/icon/upgrade-icon.svg'
import monsterStore from '../../stores/MonsterStore'
import { USER_INVENTORY_DELETE } from '../../api/graphql/mutation'
import { ApolloError } from '@apollo/client'
import inventoriesStore from '../../stores/InventoriesStore'
import HeaderBar from '../../components/Header/HeaderBar'
import RoundButton from '../../components/Button/RoundButton'
import SimpleBar from 'simplebar-react'
import { UserInventory } from '../../types/GraphResponse'
import CardsSelectSkill from './CardsSelectSkill'
import PopupCard from '../../components/PopupCard/PopupCard'
import SelectMonster from './SelectMonster'
import InfoPopupSkill from './InfoPopupSkill'
import { showTopAlert } from '../../components/TopAlert/topAlertBus'
import CardSkillDescriptions from './CardSkillDescriptions'
import { useTranslation } from 'react-i18next'

const SkillMenu = observer(() => {
  const navigate = useNavigate()
  const { monsterIdParams, replacedSkillIdParams } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInventory, setSelectedInventory] = useState<UserInventory | null>(null)
  const [openPopupCard, setOpenPopupCard] = useState(false)
  const [showSelectMonster, setShowSelectMonster] = useState(false)
  const [showInfoPopupSkill, setShowInfoPopupSkill] = useState(false)
  const { t } = useTranslation()

  const fetchInventoriesAndMonsters = useCallback(
    async (withLoading: boolean) => {
      try {
        if (withLoading) setIsLoading(true)
        await authorizationAndInitTelegram(navigate)

        await inventoriesStore.fetchInventories()
        await monsterStore.fetchMonsters()

        setIsLoading(false)
      } catch {
        showTopAlert({ text: t('skillMenu.errorLoading'), open: true, variant: 'error' })
        setIsLoading(false)
      }
    },
    [navigate, t],
  )

  useEffect(() => {
    fetchInventoriesAndMonsters(true)
  }, [monsterIdParams, fetchInventoriesAndMonsters])

  if (isLoading && inventoriesStore.inventories.length === 0) {
    return <Loading />
  }

  const handlerAppllySkill = async () => {
    setShowInfoPopupSkill(false)
    if (monsterIdParams && selectedInventory) {
      try {
        await monsterStore.apllySkillToMonster(
          monsterIdParams,
          selectedInventory.id,
          replacedSkillIdParams,
        )
        navigate(`/monster-menu/${monsterIdParams}`)
      } catch {
        showTopAlert({ text: t('skillMenu.applySkillError'), open: true, variant: 'error' })
      }
    }
    setShowSelectMonster(true)
  }

  const rederectToMonsterMenu = (monsterId: string) => {
    setShowSelectMonster(false)
    if (selectedInventory) {
      navigate(`/monster-menu/${monsterId}/${selectedInventory.id}`)
    }
  }

  const handlerDeleteSkill = async (userInventory: UserInventory) => {
    try {
      await client.query({
        query: USER_INVENTORY_DELETE,
        variables: { userInventoryDeleteId: userInventory.id },
        fetchPolicy: 'no-cache',
      })
      await inventoriesStore.fetchInventories()
    } catch (error: unknown) {
      //TODO UPDATE ERROR
      let message = ''
      if (error instanceof ApolloError) {
        message =
          error.message || error.graphQLErrors?.[0]?.message || error.networkError?.message || ''
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        message = (error as { message: string }).message
      } else {
        message = String(error)
      }
      if (message.includes('Skill not found in user inventory')) {
        showTopAlert({ text: t('skillMenu.skillNotFound'), variant: 'error', open: true })
      } else {
        showTopAlert({ text: t('skillMenu.deleteSkillError'), open: true, variant: 'error' })
      }
    }
    setOpenPopupCard(false)
    setSelectedInventory(null)
  }

  const handleExit = () => {
    const idx = (window.history.state && (window.history.state as any).idx) ?? 0
    const canGoBack = idx > 0 || window.history.length > 1

    if (canGoBack) {
      navigate(-1)
    } else {
      navigate('/laboratory', { replace: true })
    }
  }

  return (
    <div className={styles.SkillMenu}>
      <HeaderBar
        icon={upgradeIcon}
        title={t('skillMenu.upgrades')}
        rightContent={<RoundButton type="exit" onClick={handleExit} />}
      />
      {showSelectMonster && selectedInventory ? (
        <SelectMonster
          monsters={monsterStore.monsters}
          onSelectMonster={(monster) => {
            rederectToMonsterMenu(monster.id)
          }}
          onClose={() => setShowSelectMonster(false)}
        />
      ) : (
        <>
          {replacedSkillIdParams && monsterIdParams ? (
            <CardSkillDescriptions
              skillId={replacedSkillIdParams}
              monsterId={monsterIdParams}
              monsterStore={monsterStore}
            />
          ) : (
            <></>
          )}
          <SimpleBar className={styles.scrollArea}>
            <CardsSelectSkill
              skillIdForReplace={replacedSkillIdParams}
              monsters={monsterStore.monsters}
              inventoriesStore={inventoriesStore.inventories}
              onSelectSkill={(inventory) => {
                setSelectedInventory(inventory)
                setShowInfoPopupSkill(true)
              }}
            />
          </SimpleBar>
        </>
      )}

      <InfoPopupSkill
        showInfoPopupSkill={showInfoPopupSkill}
        userInventory={selectedInventory}
        onClose={() => setShowInfoPopupSkill(false)}
        onClick={handlerAppllySkill}
        onClickDelete={() => setOpenPopupCard(true)}
        monsterId={monsterIdParams}
      />

      {openPopupCard && selectedInventory && (
        <PopupCard
          title={t('skillMenu.disposeConfirmTitle', {
            skill: selectedInventory.skill?.name || t('skillMenu.skillFallback'),
          })}
          subtitle={t('skillMenu.disposeConfirmSubtitle')}
          onClose={() => setOpenPopupCard(false)}
          onButtonClick={() => handlerDeleteSkill(selectedInventory)}
        />
      )}
    </div>
  )
})

export default SkillMenu
