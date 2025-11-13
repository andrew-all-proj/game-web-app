import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import styles from './CreateMonster.module.css'
import MainInput from '../../components/Input/MainInput'
import headIcon from '../../assets/icon/icon_head.svg'
import bodyIcon from '../../assets/icon/icon_body.svg'
import armsIcon from '../../assets/icon/icon_arms.svg'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import { FILES } from '../../api/graphql/query'
import { FileItem, GraphQLListResponse } from '../../types/GraphResponse'
import client from '../../api/apolloClient'
import { getMaxVersion } from '../../functions/get-max-version'
import { FrameData, SpriteAtlas } from '../../types/sprites'
import errorStore from '../../stores/ErrorStore'
import PreviewMonster from './PreviewMonster'
import { createPartPreviews } from './create-part-previews'
import userStore from '../../stores/UserStore'
import { MONSTER_CREATE } from '../../api/graphql/mutation'
import monsterStore from '../../stores/MonsterStore'
import Loading from '../loading/Loading'
import PartSelectorMonster from '../../components/PartSelector/PartSelectorMonster'
import RoundButton from '../../components/Button/RoundButton'
import CharacteristicMonster from '../../components/CharacteristicMonster/CharacteristicMonster'
import { showTopAlert } from '../../components/TopAlert/topAlertBus'
import IncubatorOverlay from '../../components/IncubatorOverlay/IncubatorOverlay'
import clsx from 'clsx'

declare global {
  interface Window {
    updatePhaserDisplay?: () => void
  }
}

export interface PartPreviewEntry {
  key: string
  frameData: FrameData
}

export interface SelectedPartInfo {
  key: string
  frameSize: { w: number; h: number; x: number; y: number }
}

export interface SelectedParts {
  head?: SelectedPartInfo
  body?: SelectedPartInfo
  leftArm?: SelectedPartInfo
  rightArm?: SelectedPartInfo
}

export interface PartPreviews {
  head: PartPreviewEntry[]
  body: PartPreviewEntry[]
  arms: { arm: { left: PartPreviewEntry; right: PartPreviewEntry } }[]
}

export interface PartIcons {
  head: { id: string; key: string; frameData: FrameData }[]
  body: { id: string; key: string; frameData: FrameData }[]
  arms: { id: string; key: string; frameData: FrameData }[]
}

type PartTab = keyof PartPreviews

type HeadBodyPart = PartPreviewEntry
type ArmPair = { arm: { left: PartPreviewEntry; right: PartPreviewEntry } }
export type SelectablePart = HeadBodyPart | ArmPair | null

const CreateMonster = observer(() => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [spriteAtlasJson, setSpriteAtlasJson] = useState<SpriteAtlas | null>(null)
  const [partPreviews, setPartPreviews] = useState<{ parts: PartPreviews; icons: PartIcons }>({
    parts: { head: [], body: [], arms: [] },
    icons: { head: [], body: [], arms: [] },
  })
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [headIndex, setHeadIndex] = useState(0)
  const [bodyIndex, setBodyIndex] = useState(0)
  const [armsIndex, setArmsIndex] = useState(0)
  const [selectedParts, setSelectedParts] = useState<SelectedParts>({
    head: undefined,
    body: undefined,
    leftArm: undefined,
    rightArm: undefined,
  })
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [activeTab, setActiveTab] = useState<PartTab>('body')
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    const fetchMainSprite = async () => {
      await authorizationAndInitTelegram(navigate)
      try {
        const { data }: { data: { Files: GraphQLListResponse<FileItem> } } = await client.query({
          query: FILES,
          variables: {
            limit: 10,
            offset: 0,
            contentType: 'BASE_SPRITE_SHEET_MONSTERS',
          },
        })

        const imageFiles = data?.Files?.items?.filter((item) => item.fileType === 'IMAGE')
        const jsonFiles = data?.Files?.items?.filter((item) => item.fileType === 'JSON')

        const spriteFile = getMaxVersion(imageFiles)
        const atlasFile = getMaxVersion(jsonFiles)

        if (spriteFile && atlasFile) {
          const atlasResponse = await fetch(atlasFile.url)
          const atlasJson: SpriteAtlas = await atlasResponse.json()
          if (!atlasJson) {
            errorStore.setError({
              error: true,
              message: 'Не удалось загрузить атлас с сервера',
            })
          }
          setSpriteAtlasJson(atlasJson)
          setPartPreviews(createPartPreviews(atlasJson))
          setSpriteUrl(spriteFile.url)
        } else {
          errorStore.setError({
            error: true,
            message: 'Не удалось загрузить спрайты с сервера',
          })
          navigate('/error')
        }
        setIsLoading(false)
      } catch (error) {
        errorStore.setError({
          error: true,
          message: `Ошибка при загрузке спрайтов: ${error}`,
        })
        navigate('/error')
      }
    }

    fetchMainSprite()
  }, [navigate])

  const handlePartSelect = (id: string) => {
    if (!id) return

    setSelectedParts((prev) => {
      const next: SelectedParts = { ...prev }

      // HEAD
      if (activeTab === 'head') {
        const part = partPreviews.parts.head.find((item) => item.key === id)
        if (!part) return prev

        next.head = {
          key: part.key,
          frameSize: part.frameData?.frame ?? { x: 0, y: 0, w: 0, h: 0 },
        }

        return next
      }

      // BODY
      if (activeTab === 'body') {
        const part = partPreviews.parts.body.find((item) => item.key === id)
        if (!part) return prev

        next.body = {
          key: part.key,
          frameSize: part.frameData?.frame ?? { x: 0, y: 0, w: 0, h: 0 },
        }

        return next
      }

      if (activeTab === 'arms') {
        const armPair = partPreviews.parts.arms.find(
          (pair) => pair.arm.left.key === id || pair.arm.right.key === id,
        )
        if (!armPair) return prev

        const left = armPair.arm.left
        const right = armPair.arm.right

        next.leftArm = {
          key: left.key,
          frameSize: left.frameData?.frame ?? { x: 0, y: 0, w: 0, h: 0 },
        }

        next.rightArm = {
          key: right.key,
          frameSize: right.frameData?.frame ?? { x: 0, y: 0, w: 0, h: 0 },
        }

        return next
      }

      return prev
    })
  }

  const handleSaveImage = async () => {
    if (isSaving) return
    if (!name.trim()) return showTopAlert({ text: 'Введите имя монстра', variant: 'info' })
    if (name.length > 10)
      return showTopAlert({ text: 'Имя монстра не должно превышать 10 символов', variant: 'info' })
    if (!selectedParts.body) return showTopAlert({ text: 'Выберите тело', variant: 'info' })
    if (!selectedParts.head) return showTopAlert({ text: 'Выберите голову', variant: 'info' })
    if (!selectedParts.leftArm) return showTopAlert({ text: 'Выберите руки', variant: 'info' })
    if (!spriteAtlasJson || !spriteUrl) {
      showTopAlert({ text: 'Спрайты не загружены', variant: 'error' })
      return
    }

    setIsSaving(true)

    try {
      const resultCreateMonster = await client.mutate({
        mutation: MONSTER_CREATE,
        variables: {
          name: name.trim(),
          selectedPartsKey: {
            headKey: selectedParts.head?.key,
            bodyKey: selectedParts.body?.key,
            leftArmKey: selectedParts.leftArm?.key,
            rightArmKey: selectedParts.rightArm?.key,
          },
        },
        errorPolicy: 'all',
      })

      if (resultCreateMonster.errors) {
        if (resultCreateMonster.errors[0].message === 'Not enough energy to create a monster') {
          showTopAlert({ text: 'Недостаточно энергии для создания монстра', variant: 'warning' })
        } else if (resultCreateMonster.errors[0].message === 'User already has 4 monsters') {
          showTopAlert({ text: 'У вас уже есть 4 монстра', variant: 'warning' })
        } else {
          showTopAlert({ text: 'Ошибка при создании монстра', variant: 'error' })
        }
        setIsSaving(false)
        return
      }

      if (userStore.user?.id) {
        await monsterStore.fetchMonsters(userStore.user?.id)
      }

      navigate('/laboratory')
    } catch (err) {
      console.log('Error saving monster:', err)
      setIsSaving(false)
      showTopAlert({ text: 'Ошибка при сохранении монстра', variant: 'error' })
    }
  }

  useEffect(() => {
    if (!isLoading) {
      setAnimateIn(true)
    }
  }, [isLoading])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className={styles.createMonster}>
      <IncubatorOverlay open={isSaving} text="Создание монстра…" />

      {/* ВЕРХ */}
      <div className={styles.header}>
        <RoundButton
          onClick={() => navigate('/laboratory')}
          type="exit"
          className={styles.exitButton}
        />
        <CharacteristicMonster
          level={1}
          hp={100}
          stamina={60}
          defense={12}
          strength={10}
          evasion={5}
          className={styles.characteristicMonster}
        />
      </div>

      <div className={styles.centerWrapper}>
        <PreviewMonster
          spriteAtlas={spriteAtlasJson}
          spriteSheets={spriteUrl}
          selectedParts={selectedParts}
          canvasRef={canvasRef}
        />
      </div>

      <div className={styles.inputWrapper}>
        <MainInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="_введите имя"
          type="text"
          onButtonClick={isSaving ? () => {} : handleSaveImage}
        />
      </div>
      <div className={clsx(styles.partSelectorWrapper, { [styles.visible]: animateIn })}>
        <PartSelectorMonster
          tabs={[
            {
              key: 'head',
              icon: headIcon,
              alt: 'Head',
              parts: partPreviews.icons.head,
              selectedIndex: headIndex,
              setSelectedIndex: setHeadIndex,
            },
            {
              key: 'body',
              icon: bodyIcon,
              alt: 'Body',
              parts: partPreviews.icons.body,
              selectedIndex: bodyIndex,
              setSelectedIndex: setBodyIndex,
            },
            {
              key: 'arms',
              icon: armsIcon,
              alt: 'Arms',
              parts: partPreviews.icons.arms,
              selectedIndex: armsIndex,
              setSelectedIndex: setArmsIndex,
            },
          ]}
          activeTab={activeTab}
          onTabChange={(tabKey) => setActiveTab(tabKey as keyof PartPreviews)}
          spriteUrl={spriteUrl}
          onSelectPart={handlePartSelect}
        />
      </div>
    </div>
  )
})

export default CreateMonster
