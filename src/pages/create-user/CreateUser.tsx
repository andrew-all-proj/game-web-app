import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import { useMutation } from "@apollo/client"

import userStore from "../../stores/UserStore"
import styles from "./CreateUser.module.css"
import Header from "../../components/Header/Header"
import { USER_UPDATE } from "../../api/graphql/mutation"
import { FILES } from "../../api/graphql/query"
import client from "../../api/apolloClient"

import noAvatar from "../../assets/images/no-avatar.jpg"

const CreateUser = observer(() => {
  const [name, setName] = useState("")
  const [avatars, setAvatars] = useState<{ id: string; url: string }[]>([
    { id: '', url: noAvatar },
  ])
  const [avatarIndex, setAvatarIndex] = useState(0)
  const [userUpdate] = useMutation(USER_UPDATE)
  const navigate = useNavigate()

  useEffect(() => {
    if (!userStore.user?.id) {
      navigate("/")
    }
  }, [navigate])

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const { data } = await client.query({
          query: FILES,
          variables: {
            limit: 10,
            offset: 0,
            contentType: "AVATAR_PROFESSOR", 
          },
        })

        const newAvatars = data?.Files?.items
          ?.filter((item: any) => item.url)
          ?.map((item: any) => {return {id: item.id, url: item.url}}) || []

        if (newAvatars.length > 0) {
          setAvatars((prev) => [...prev, ...newAvatars])
        }
      } catch (error) {
        console.error("Ошибка при загрузке аватаров:", error)
      }
    }

    fetchAvatars()
  }, [userStore.user?.id])

  const handleCreateUser = async () => {
    if (!name.trim() || !userStore.user?.id) return

    try {
      const { data } = await userUpdate({
        variables: {
          id: userStore.user.id,
          nameProfessor: name,
          avatarFileId: avatars[avatarIndex].id || null,
          isRegistered: true,
        },
      })

      if (data?.UserUpdate) {
        userStore.setUser(data.UserUpdate)
        navigate("/laboratory")
      }
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error)
    }
  }

  const nextAvatar = () => {
    setAvatarIndex((prev) => (prev + 1) % avatars.length)
  }

  const prevAvatar = () => {
    setAvatarIndex((prev) => (prev - 1 + avatars.length) % avatars.length)
  }

  return (
    <div className={styles.createUser}>
      <Header />
      <main className={styles.main}>
        <div className={styles.logoWrapper}>
          <h3>Создание пользователя</h3>
        </div>

        <div>
          <h4>Выберите аватар</h4>
          <div className={styles.avatarPreview}>
            <img
              src={avatars[avatarIndex].url}
              alt="Аватар"
              className={styles.avatarImage}
            />
          </div>
          <div className={styles.avatarButtons}>
            <button onClick={prevAvatar}>◀ Прошлый</button>
            <button onClick={nextAvatar}>Следующий ▶</button>
          </div>
        </div>

        <div>
          <h4>Введите ваше имя</h4>
          <input
            type="text"
            value={name}
            placeholder="Введите Ваше имя Профессор"
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleCreateUser} disabled={!name.trim()}>
            Создать
          </button>
        </div>
      </main>
    </div>
  )
})

export default CreateUser
