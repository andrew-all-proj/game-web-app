import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import hairIcon from '../../assets/icon/icon_hair.svg'
import clothesIcon from '../../assets/icon/icon_clothes.svg'
import emotionIcon from '../../assets/icon/icon_face.svg'
import userStore from '../../stores/UserStore'
import styles from './CreateUser.module.css'
import { uploadFile } from '../../api/upload-file'
import client from '../../api/apolloClient'
import { USER_UPDATE } from '../../api/graphql/mutation'
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

interface PartTypeAvatar {
  part: string
  icon: string
}

const CreateUser = observer(() => {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [headParts, setHeadParts] = useState<PartTypeAvatar[]>([])
  const [bodyParts, setClothesParts] = useState<PartTypeAvatar[]>([])
  const [emotionParts, setEmotionParts] = useState<PartTypeAvatar[]>([])

  const [headIndex, setHeadIndex] = useState(0)
  const [bodyIndex, setBodyIndex] = useState(0)
  const [emotionIndex, setEmotionIndex] = useState(0)

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const [activeTab, setActiveTab] = useState<string>('head')

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    const loadSvgSprite = async () => {
      if (!userStore.user?.id) {
        const auth = await authorizationAndInitTelegram(navigate)
        if (!auth) {
          navigate('/')
        }
      }
      setName(userStore.user?.nameProfessor || '')
      try {
        const { data }: { data: { Files: GraphQLListResponse<FileItem> } } = await client.query({
          query: FILES,
          variables: {
            limit: 10,
            offset: 0,
            contentType: 'SPRITE_SHEET_USER_AVATAR',
          },
          fetchPolicy: 'no-cache',
        })

        const spriteFiles = data?.Files?.items?.filter(
          (item) => item.fileType === 'IMAGE' && item.url.endsWith('.svg'),
        )

        const spriteFile = getMaxVersion(spriteFiles)

        if (!spriteFile) {
          setMessage('SVG файл спрайта не найден.')
          errorStore.setError({
            error: true,
            message: 'Не удалось загрузить спрайты с сервера',
          })
          navigate('/error')
          return
        }

        const res = await fetch(`${spriteFile.url}?t=${Date.now()}`)
        const svgText = await res.text()

        const container = document.createElement('div')
        container.style.display = 'none'
        container.innerHTML = svgText
        document.body.appendChild(container)

        const parser = new DOMParser()
        const doc = parser.parseFromString(svgText, 'image/svg+xml')
        const symbols = Array.from(doc.querySelectorAll('symbol'))

        const heads: PartTypeAvatar[] = []
        const clothes: PartTypeAvatar[] = []
        const emotions: PartTypeAvatar[] = []
        for (const symbol of symbols) {
          const id = symbol.getAttribute('id') || ''
          const match = id.match(/^ava-(head|clothes|emotion)_icon_(\d+)$/)
          if (!match) continue

          const [, type, index] = match
          const partId = `ava-${type}_${index}`

          const foundPart = symbols.find((s) => s.getAttribute('id') === partId)
          if (!foundPart) continue

          const entry = { icon: id, part: partId }
          if (type === 'head') heads.push(entry)
          else if (type === 'clothes') clothes.push(entry)
          else if (type === 'emotion') emotions.push(entry)
        }

        if (userStore.user?.avatar?.url) {
          setIsEditing(true)
        }

        setHeadParts(heads)
        setClothesParts(clothes)
        setEmotionParts(emotions)
        setIsLoading(false)
      } catch (err) {
        setMessage('Не удалось загрузить спрайт.')
        errorStore.setError({
          error: true,
          message: `Не удалось загрузить спрайты с сервера ${err}`,
        })
        navigate('/error')
      }
    }

    loadSvgSprite()
  }, [navigate])

  const drawAvatarToCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

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

    const serveData = (id: string | undefined) => {
      if (!id) return null
      const symbol = document.getElementById(id) as unknown as SVGSymbolElement
      if (!symbol) return null

      const viewBox = symbol.getAttribute('viewBox')
      if (!viewBox) return null

      const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number)

      const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
        ${symbol.innerHTML}
      </svg>`

      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)

      return { url, vbWidth, vbHeight }
    }

    const parts = [
      serveData(bodyParts[bodyIndex]?.part),
      serveData(headParts[headIndex]?.part),
      serveData(emotionParts[emotionIndex]?.part),
    ].filter(Boolean) as { url: string; vbWidth: number; vbHeight: number }[]

    for (const part of parts) {
      const { url, vbWidth, vbHeight } = part

      await new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => {
          const scale = 0.85
          ctx.drawImage(img, 0, 0, vbWidth * scale, vbHeight * scale)
          URL.revokeObjectURL(url)
          resolve()
        }
        img.src = url
      })
    }
  }, [headIndex, bodyIndex, emotionIndex, headParts, bodyParts, emotionParts, isEditing])

  useEffect(() => {
    drawAvatarToCanvas()
  }, [drawAvatarToCanvas])

  const handleSaveAvatar = async () => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      setMessage('Пожалуйста, введите имя.')
      return
    }
    if (trimmedName.length > 15) {
      setMessage('Имя не должно превышать 15 символов.')
      return
    }

    const nameChanged = trimmedName !== userStore.user?.nameProfessor

    if (isEditing && !nameChanged) {
      navigate('/laboratory')
      return
    }

    let avatarFileId = null

    if (!isEditing) {
      if (
        headIndex === null ||
        bodyIndex === null ||
        emotionIndex === null ||
        !headParts[headIndex]?.part ||
        !bodyParts[bodyIndex]?.part ||
        !emotionParts[emotionIndex]?.part
      ) {
        setMessage('Пожалуйста, выберите голову, одежду и лицо.')
        return
      }

      const canvas = canvasRef.current
      if (!canvas) return

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png'),
      )

      if (!blob) {
        setMessage('Ошибка при создании изображения.')
        return
      }

      const formData = new FormData()
      formData.append('file', new File([blob], 'avatar.png', { type: 'image/png' }))
      formData.append('name', 'avatar')
      formData.append('fileType', 'IMAGE')
      formData.append('contentType', 'AVATAR_PROFESSOR')

      try {
        const resultUploadFile = await uploadFile({
          url: `${import.meta.env.VITE_API_FILE}/upload`,
          formData,
          token: userStore.user?.token,
        })

        avatarFileId = resultUploadFile.id || null
      } catch (error) {
        console.error('Ошибка загрузки изображения:', error)
        setMessage('Ошибка загрузки изображения.')
        return
      }
    }

    try {
      const { data } = await client.mutate({
        mutation: USER_UPDATE,
        variables: {
          id: userStore.user?.id,
          nameProfessor: trimmedName,
          avatarFileId: avatarFileId ?? userStore.user?.avatar?.id ?? null,
          isRegistered: true,
        },
      })

      if (data?.UserUpdate) {
        userStore.setUser(data.UserUpdate)
        navigate('/laboratory')
      } else {
        setMessage('Аватар загружен, но пользователь не обновлён.')
      }
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error)
      setMessage('Ошибка сохранения. Попробуйте снова.')
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
    <div className={styles.createUser}>
      <div className={styles.navigate}>
        <RoundButton onClick={() => navigate('/laboratory')} />
      </div>

      <div className={styles.centerContent}>
        <div className={styles.avatarWrapper}>
          <canvas ref={canvasRef} width={142} height={142} className={styles.avatarCanvas} />
        </div>

        <div className={styles.infoMessage}>{message}</div>
        <MainInput
          placeholder="_введите Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onButtonClick={handleSaveAvatar}
        />
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
        />
      </div>
    </div>
  )
})

export default CreateUser
