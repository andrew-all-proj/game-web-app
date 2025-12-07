import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import hairIcon from '../../assets/icon/icon_hair.svg'
import clothesIcon from '../../assets/icon/icon_clothes.svg'
import emotionIcon from '../../assets/icon/icon_face.svg'
import userStore from '../../stores/UserStore'
import styles from './CreateUser.module.css'
import client from '../../api/apolloClient'
import { FILES } from '../../api/graphql/query'
import { FileItem, GraphQLListResponse } from '../../types/GraphResponse'
import { getMaxVersion } from '../../functions/get-max-version'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import MainInput from '../../components/Input/MainInput'
import PartSelector from '../../components/PartSelector/PartSelector'
import Loading from '../loading/Loading'
import errorStore from '../../stores/ErrorStore'
import RoundButton from '../../components/Button/RoundButton'
import clsx from 'clsx'
import { showTopAlert } from '../../components/TopAlert/topAlertBus'
import IncubatorOverlay from '../../components/IncubatorOverlay/IncubatorOverlay'
import LanguageDropdown from '../../components/LanguageDropdown/LanguageDropdown'
import { useTranslation } from 'react-i18next'
import { LanguageEnum } from '../../types/enums/LanguageEnum'

type AtlasFrames = Record<
  string,
  {
    frame: { x: number; y: number; w: number; h: number }
    rotated: boolean
    trimmed: boolean
    spriteSourceSize: { x: number; y: number; w: number; h: number }
    sourceSize: { w: number; h: number }
  }
>

type Atlas = {
  frames: AtlasFrames
  meta: {
    image: string
    size: { w: number; h: number }
    scale?: number | string
  }
}

interface PartTypeAvatar {
  part: string
  icon: string
}

const CreateUser = observer(() => {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { t } = useTranslation()

  const [headParts, setHeadParts] = useState<PartTypeAvatar[]>([])
  const [bodyParts, setBodyParts] = useState<PartTypeAvatar[]>([])
  const [emotionParts, setEmotionParts] = useState<PartTypeAvatar[]>([])

  const [headIndex, setHeadIndex] = useState(0)
  const [bodyIndex, setBodyIndex] = useState(0)
  const [emotionIndex, setEmotionIndex] = useState(0)

  const [name, setName] = useState('')

  const [activeTab, setActiveTab] = useState<string>('head')

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  const spriteImgRef = useRef<HTMLImageElement | null>(null)
  const atlasRef = useRef<Atlas | null>(null)

  useEffect(() => {
    const loadSpriteAndAtlas = async () => {
      if (!userStore.user?.id) {
        const auth = await authorizationAndInitTelegram(navigate)
        if (!auth) {
          navigate('/')
          return
        }
      }

      setName(userStore.user?.nameProfessor || '')

      try {
        const { data }: { data: { Files: GraphQLListResponse<FileItem> } } = await client.query({
          query: FILES,
          variables: {
            limit: 50,
            offset: 0,
            contentType: 'SPRITE_SHEET_USER_AVATAR',
          },
          fetchPolicy: 'no-cache',
        })

        const spriteFiles = data?.Files?.items?.filter(
          (item) => item.fileType === 'IMAGE' && item.url.endsWith('.png'),
        )
        const atlasFiles = data?.Files?.items?.filter(
          (item) => item.fileType === 'JSON' && item.url.endsWith('.json'),
        )

        const spriteFile = getMaxVersion(spriteFiles)
        const atlasFile = getMaxVersion(atlasFiles)

        if (!spriteFile || !atlasFile) {
          errorStore.setError({
            error: true,
            message: t('createUser.spritesLoadError'),
          })
          navigate('/error')
          return
        }

        const atlasJsonRes = await fetch(`${atlasFile.url}?t=${Date.now()}`)
        const atlasJson = (await atlasJsonRes.json()) as Atlas
        atlasRef.current = atlasJson

        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = (e) => reject(e)
          img.src = `${spriteFile.url}?t=${Date.now()}`
        })
        spriteImgRef.current = img

        const frames = Object.keys(atlasJson.frames)
        const heads: PartTypeAvatar[] = []
        const bodies: PartTypeAvatar[] = []
        const emotions: PartTypeAvatar[] = []

        const iconRe = /^ava-(head|clothes|emotion)_icon_(\d+)$/

        for (const f of frames) {
          const m = f.match(iconRe)
          if (!m) continue
          const [, type, idx] = m
          const partName = `ava-${type}_${idx}`
          if (atlasJson.frames[partName]) {
            const entry: PartTypeAvatar = { icon: f, part: partName }
            if (type === 'head') heads.push(entry)
            else if (type === 'clothes') bodies.push(entry)
            else if (type === 'emotion') emotions.push(entry)
          }
        }

        if (userStore.user?.avatar?.url) {
          setIsEditing(true)
        }

        setHeadParts(heads.sort())
        setBodyParts(bodies.sort())
        setEmotionParts(emotions.sort())

        setIsLoading(false)
      } catch (err) {
        errorStore.setError({
          error: true,
          message: t('createUser.spritesLoadErrorWithReason', { reason: String(err) }),
        })
        navigate('/error')
      }
    }

    loadSpriteAndAtlas()
  }, [navigate, t])

  const getFrame = useCallback((name?: string) => {
    if (!name || !atlasRef.current) return null
    return atlasRef.current.frames[name] ?? null
  }, [])

  const drawAvatarToCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    const spriteImg = spriteImgRef.current
    const atlas = atlasRef.current
    if (!canvas || !spriteImg || !atlas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (isEditing && userStore.user?.avatar?.url) {
      const avatarImage = new Image()
      avatarImage.crossOrigin = 'anonymous'
      avatarImage.src = userStore.user.avatar.url
      await new Promise<void>((resolve) => {
        avatarImage.onload = () => {
          ctx.drawImage(avatarImage, 0, 0, canvas.width, canvas.height)
          resolve()
        }
      })
      return
    }

    const layers = [
      getFrame(bodyParts[bodyIndex]?.part),
      getFrame(headParts[headIndex]?.part),
      getFrame(emotionParts[emotionIndex]?.part),
    ].filter(Boolean) as AtlasFrames[keyof AtlasFrames][]

    const maxW = Math.max(...layers.map((l) => l.frame.w))
    const maxH = Math.max(...layers.map((l) => l.frame.h))

    const scaleX = canvas.width / maxW
    const scaleY = canvas.height / maxH
    const scale = Math.min(scaleX, scaleY) * 1

    for (const layer of layers) {
      const { x, y, w, h } = layer.frame
      const dstW = Math.max(1, Math.round(w * scale))
      const dstH = Math.max(1, Math.round(h * scale))
      const dx = Math.round((canvas.width - dstW) / 2)
      const dy = Math.round((canvas.height - dstH) / 2)

      ctx.drawImage(
        spriteImg,
        x,
        y,
        w,
        h, // src rect
        dx,
        dy,
        dstW,
        dstH, // dst rect
      )
    }
  }, [headIndex, bodyIndex, emotionIndex, headParts, bodyParts, emotionParts, isEditing, getFrame])

  useEffect(() => {
    drawAvatarToCanvas()
  }, [drawAvatarToCanvas])

  const handleSaveAvatar = async () => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      showTopAlert({ text: t('createUser.enterName'), variant: 'info' })
      return
    }
    if (trimmedName.length > 10) {
      showTopAlert({ text: t('createUser.nameTooLong'), variant: 'info' })
      return
    }

    const nameChanged = trimmedName !== userStore.user?.nameProfessor

    if (isEditing && !nameChanged) {
      navigate('/laboratory')
      return
    }
    setIsSaving(true)
    const avatarFileId = null

    if (!isEditing) {
      if (
        headIndex === null ||
        bodyIndex === null ||
        emotionIndex === null ||
        !headParts[headIndex]?.part ||
        !bodyParts[bodyIndex]?.part ||
        !emotionParts[emotionIndex]?.part
      ) {
        showTopAlert({ text: t('createUser.selectParts'), variant: 'info' })
        setIsSaving(false)
        return
      }
    }

    const toIndex = (frameName?: string): number | null => {
      if (!frameName) return null
      const m = frameName.match(/_(\d+)$/)
      return m ? Number(m[1]) : null
    }

    const headPartId = isEditing ? null : toIndex(headParts[headIndex]?.part)
    const bodyPartId = isEditing ? null : toIndex(bodyParts[bodyIndex]?.part)
    const emotionPartId = isEditing ? null : toIndex(emotionParts[emotionIndex]?.part)

    if (!isEditing && (headPartId == null || bodyPartId == null || emotionPartId == null)) {
      showTopAlert({ text: t('createUser.selectParts'), variant: 'info' })
      setIsSaving(false)
      return
    }

    try {
      await userStore.updateUserProfile({
        nameProfessor: trimmedName,
        isRegistered: true,
        avatarFileId: avatarFileId ?? userStore.user?.avatar?.id ?? null,
        userSelectedParts: isEditing
          ? undefined
          : { bodyPartId: bodyPartId!, headPartId: headPartId!, emotionPartId: emotionPartId! },
      })

      navigate('/laboratory')
    } catch {
      showTopAlert({ text: t('createUser.saveError'), variant: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handlerUpdateLanguage = (lang: LanguageEnum) => {
    userStore.setLanguage(lang, navigate)
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
    <div className={styles.createUser}>
      <IncubatorOverlay open={isSaving} text="Изменяем ваши внешние данные..." />
      <div className={styles.navigate}>
        <RoundButton onClick={() => navigate('/laboratory')} />
        <LanguageDropdown
          defaultLang={userStore.user?.language || LanguageEnum.RU}
          onChange={handlerUpdateLanguage}
        />
      </div>

      <div className={styles.centerContent}>
        <div className={styles.avatarWrapper}>
          <canvas ref={canvasRef} width={142} height={142} className={styles.avatarCanvas} />
        </div>

        <div className={styles.inputWrapper}>
          <MainInput
            label={t('createUser.name')}
            placeholder={t('createUser.inputName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onButtonClick={handleSaveAvatar}
          />
        </div>
      </div>

      <div className={clsx(styles.partSelectorWrapper, { [styles.visible]: animateIn })}>
        <PartSelector
          tabs={[
            {
              key: 'head',
              icon: hairIcon,
              alt: 'Голова',
              parts: headParts,
              selectedIndex: headIndex,
              setSelectedIndex: setHeadIndex,
            },
            {
              key: 'body',
              icon: clothesIcon,
              alt: 'Одежда',
              parts: bodyParts,
              selectedIndex: bodyIndex,
              setSelectedIndex: setBodyIndex,
            },
            {
              key: 'emotion',
              icon: emotionIcon,
              alt: 'Эмоции',
              parts: emotionParts,
              selectedIndex: emotionIndex,
              setSelectedIndex: setEmotionIndex,
            },
          ]}
          rows={2}
          columns={4}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          setIsEditing={setIsEditing}
          spriteImg={spriteImgRef.current}
          getFrame={getFrame}
          iconSize={70}
        />
      </div>
    </div>
  )
})

export default CreateUser
