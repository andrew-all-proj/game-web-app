import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import userStore from "../../stores/UserStore"
import { useNavigate } from "react-router-dom"
import styles from "./CreateMonster.module.css"
import Header from "../../components/Header/Header"
import { authorizationAndInitTelegram } from "../../functions/authorization-and-init-telegram"
import Loading from "../loading/Loading"
import ConstructorMonster from "./ConstructorMonster"
import { MONSTER_CREATE } from "../../api/graphql/mutation"
import client from "../../api/apolloClient"
import { uploadFile } from "../../api/upload-file"
import monsterStore from "../../stores/MonsterStore"
import MainButton from "../../components/Button/MainButton"
import { assembleMonsterCanvas } from "./save-image"
import spriteAtlasJson from '../../assets/sprite-sheets/sprite-atlas.json';
import spriteSheets from '../../assets/sprite-sheets/sprite.png';

const CreateMonster = observer(() => {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    authorizationAndInitTelegram(navigate);
  }, []);

  const handleGoToLaboratory = () => {
    navigate("/laboratory")
  }

  const handleSaveImage = async (
    monsterName: string,
    selected: { [key: string]: string | undefined },
  )=> {
    try {
      const canvas = await assembleMonsterCanvas(selected, spriteAtlasJson, spriteSheets);
  
      canvas.toBlob(async (blob) => {
        if (!blob) return;
  
        const file = new File([blob], 'monster.png', { type: 'image/png' });
  
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', 'monster');
        formData.append('fileType', 'IMAGE');
        formData.append('contentType', 'AVATAR_MONSTER');
  
        const result = await uploadFile({
          url: `${import.meta.env.VITE_API_FILE}/upload`,
          formData,
          token: userStore.user?.token,
        });
  
        await client.mutate({
          mutation: MONSTER_CREATE,
          variables: {
            name: monsterName,
            fileId: result.id,
          },
        });
  
        if (userStore.user?.id) {
          await monsterStore.fetchMonsters(userStore.user?.id);
        }
  
        navigate('/laboratory');
      }, 'image/png');
    } catch (err) {
      console.error('Error saving monster:', err);
      setErrorMsg('Ошибка при сохранении монстра');
    }
  };

  if (!userStore.isAuthenticated) {
    return <Loading />
  }

  return (
    <div className={styles.laboratory}>
      <Header avatarUrl={userStore.user?.avatar?.url} />
      <main className={styles.main}>
        <div className={styles.logoPlaceholder}>
          Профессор {userStore.user?.nameProfessor}, Ваша Лаборатория!
        </div>
        <div style={{ color: 'red' }}>
          {errorMsg}
        </div>
        <ConstructorMonster
          onError={setErrorMsg}
          saveImage={handleSaveImage}
        />
          <MainButton onClick={handleGoToLaboratory}>Лаборатория</MainButton>
      </main>
    </div>

  )
})

export default CreateMonster
