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
import { assembleMonsterCanvas } from '../../functions/assemble-monster-canvas'
import userStore from '../../stores/UserStore'
import { MONSTER_CREATE } from '../../api/graphql/mutation'
import { uploadFile } from '../../api/upload-file'
import monsterStore from '../../stores/MonsterStore'
import Loading from '../loading/Loading'
import PartSelectorMonster from '../../components/PartSelector/PartSelectorMonster'
import RoundButton from '../../components/Button/RoundButton'
import CharacteristicMonster from '../../components/CharacteristicMonster/CharacteristicMonster'
import { showTopAlert } from '../../components/TopAlert/topAlertBus'

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
  attachPoint: { x: number; y: number }
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

type PartTab = keyof PartPreviews

type HeadBodyPart = PartPreviewEntry
type ArmPair = { arm: { left: PartPreviewEntry; right: PartPreviewEntry } }
export type SelectablePart = HeadBodyPart | ArmPair | null

const CreateMonster = observer(() => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [spriteAtlasJson, setSpriteAtlasJson] = useState<SpriteAtlas | null>(null)
  const [partPreviews, setPartPreviews] = useState<PartPreviews>({ head: [], body: [], arms: [] })
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [headIndex, setHeadIndex] = useState(0)
  const [bodyIndex, setBodyIndex] = useState(0)
  const [armsIndex, setArmsIndex] = useState(0)

  const [activeTab, setActiveTab] = useState<PartTab>('body')
  //const [isEditing, setIsEditing] = useState(false)  //TODO for future use

  const selectedPartsMonster = useRef<SelectedParts>({
    head: undefined,
    body: undefined,
    leftArm: undefined,
    rightArm: undefined,
  })

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

  const handlePartSelect = (part: SelectablePart) => {
    if (!part) return

    if (activeTab === 'arms' && 'arm' in part) {
      selectedPartsMonster.current.leftArm = {
        key: part.arm.left.key,
        attachPoint: part.arm.left.frameData?.points?.attachToBody || { x: 0, y: 0 },
        frameSize: part.arm.left.frameData?.frame || { w: 0, h: 0, x: 0, y: 0 },
      }
      selectedPartsMonster.current.rightArm = {
        key: part.arm.right.key,
        attachPoint: part.arm.right.frameData?.points?.attachToBody || { x: 0, y: 0 },
        frameSize: part.arm.right.frameData?.frame || { w: 0, h: 0, x: 0, y: 0 },
      }
    } else if (part && 'frameData' in part) {
      const attachPoint = part.frameData?.points?.attachToBody || { x: 0, y: 0 }

      const partInfo: SelectedPartInfo = {
        key: part.key,
        attachPoint,
        frameSize: part.frameData?.frame || { w: 0, h: 0, x: 0, y: 0 },
      }

      if (activeTab === 'head') {
        selectedPartsMonster.current.head = partInfo
      } else if (activeTab === 'body') {
        selectedPartsMonster.current.body = partInfo
      }
    }

    window.updatePhaserDisplay?.()
  }

  const handleSaveImage = async () => {
    if (isSaving) return
    if (!name.trim()) return showTopAlert({ text: 'Введите имя монстра', variant: 'info' })
    if (name.length > 10)
      return showTopAlert({ text: 'Имя монстра не должно превышать 15 символов', variant: 'info' })
    if (!selectedPartsMonster.current.body)
      return showTopAlert({ text: 'Выберите тело', variant: 'info' })
    if (!selectedPartsMonster.current.head)
      return showTopAlert({ text: 'Выберите голову', variant: 'info' })
    if (!selectedPartsMonster.current.leftArm)
      return showTopAlert({ text: 'Выберите руки', variant: 'info' })
    if (!spriteAtlasJson || !spriteUrl) {
      showTopAlert({ text: 'Спрайты не загружены', variant: 'error' })
      return
    }

    setIsSaving(true)

    const selected = selectedPartsMonster.current

    try {
      const canvas = await assembleMonsterCanvas(selected, spriteAtlasJson, spriteUrl)

      canvas.toBlob(async (blob) => {
        if (!blob) return

        const file = new File([blob], 'monster.png', { type: 'image/png' })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('name', 'monster')
        formData.append('fileType', 'IMAGE')
        formData.append('contentType', 'AVATAR_MONSTER')

        const result = await uploadFile({
          url: `${import.meta.env.VITE_API_FILE}/upload`,
          formData,
          token: userStore.user?.token,
        })

        const resultCreateMonster = await client.mutate({
          mutation: MONSTER_CREATE,
          variables: {
            name: name.trim(),
            fileId: result.id,
            selectedPartsKey: {
              headKey: selected.head?.key,
              bodyKey: selected.body?.key,
              leftArmKey: selected.leftArm?.key,
              rightArmKey: selected.rightArm?.key,
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
      }, 'image/png')
    } catch (err) {
      console.log('Error saving monster:', err)
      setIsSaving(false)
      showTopAlert({ text: 'Ошибка при сохранении монстра', variant: 'error' })
    }
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className={styles.createMonster}>
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
        <div className={styles.wrapperMonster}>
          <PreviewMonster
            spriteAtlas={spriteAtlasJson}
            spriteSheets={spriteUrl}
            partPreviews={partPreviews}
            selectedPartsMonster={selectedPartsMonster}
          />
        </div>
        <div className={styles.dotWrapper}>
          <div className={styles.outerDot}>
            <div className={styles.innerDot}></div>
          </div>
        </div>
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
      <PartSelectorMonster
        tabs={[
          {
            key: 'head',
            icon: headIcon,
            alt: 'Head',
            parts: partPreviews.head,
            selectedIndex: headIndex,
            setSelectedIndex: setHeadIndex,
          },
          {
            key: 'body',
            icon: bodyIcon,
            alt: 'Body',
            parts: partPreviews.body,
            selectedIndex: bodyIndex,
            setSelectedIndex: setBodyIndex,
          },
          {
            key: 'arms',
            icon: armsIcon,
            alt: 'Arms',
            parts: partPreviews.arms,
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
  )
})

export default CreateMonster
