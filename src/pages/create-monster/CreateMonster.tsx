import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import userStore from "../../stores/UserStore";
import monsterStore from "../../stores/MonsterStore";
import client from "../../api/apolloClient";
import { FILES } from "../../api/graphql/query";
import { MONSTER_CREATE } from "../../api/graphql/mutation";
import { uploadFile } from "../../api/upload-file";
import { authorizationAndInitTelegram } from "../../functions/authorization-and-init-telegram";
import { assembleMonsterCanvas } from "../../functions/assemble-monster-canvas";
import styles from "./CreateMonster.module.css";
import Header from "../../components/Header/Header";
import ConstructorMonster, { SelectedParts } from "./ConstructorMonster";
import Loading from "../loading/Loading";
import MainButton from "../../components/Button/MainButton";
import { FileItem, GraphQLListResponse } from "../../types/GraphResponse";
import { SpriteAtlas } from "../../types/sprites";
import errorStore from "../../stores/ErrorStore";
import { getMaxVersion } from "../../functions/get-max-version";

const CreateMonster = observer(() => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const [spriteAtlasJson, setSpriteAtlasJson] = useState<any>(null);

  useEffect(() => {
    const fetchMainSprite = async () => {
      await authorizationAndInitTelegram(navigate);
      try {
        const { data }: { data: { Files: GraphQLListResponse<FileItem> } } =
          await client.query({
            query: FILES,
            variables: {
              limit: 10,
              offset: 0,
              contentType: 'BASE_SPRITE_SHEET_MONSTERS',
            },
          });
  
        const imageFiles = data?.Files?.items?.filter(
          (item) => item.fileType === 'IMAGE'
        );
        const jsonFiles = data?.Files?.items?.filter(
          (item) => item.fileType === 'JSON'
        );
  
        const spriteFile = getMaxVersion(imageFiles);
        const atlasFile = getMaxVersion(jsonFiles);
  
        if (spriteFile && atlasFile) {
          setSpriteUrl(spriteFile.url);
  
          const atlasResponse = await fetch(atlasFile.url);
          const atlasJson: SpriteAtlas = await atlasResponse.json();
          setSpriteAtlasJson(atlasJson);
        } else {
          errorStore.setError({
            error: true,
            message: 'Не удалось загрузить спрайты с сервера',
          });
          navigate('/error');
        }
      } catch (error) {
        errorStore.setError({
          error: true,
          message: 'Ошибка при загрузке спрайтов',
        });
        navigate('/error');
      }
    };
  
    fetchMainSprite();
  }, [navigate]);

  const handleGoToLaboratory = () => {
    navigate("/laboratory");
  };

  const handleSaveImage = async (monsterName: string, selected: SelectedParts) => {
    if (!spriteAtlasJson || !spriteUrl) {
      setErrorMsg('Спрайты не загружены');
      return;
    }

    try {
      const canvas = await assembleMonsterCanvas(selected, spriteAtlasJson, spriteUrl);

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
            selectedPartsKey: {
              headKey: selected.head?.key,
              bodyKey: selected.body?.key,
              leftArmKey: selected.leftArm?.key,
              rightArmKey: selected.rightArm?.key
            }
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
    return <Loading />;
  }

  if (!spriteUrl || !spriteAtlasJson) {
    return <div className={styles.loadingText}>Загрузка спрайтов...</div>;
  }

  return (
    <div className={styles.laboratory}>
      <Header avatarUrl={userStore.user?.avatar?.url} />
      <main className={styles.main}>
        <div className={styles.logoPlaceholder}>
          Профессор {userStore.user?.nameProfessor}, Ваша Лаборатория!
        </div>
        {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}
        <ConstructorMonster
          onError={setErrorMsg}
          saveImage={handleSaveImage}
          spriteSheets={spriteUrl}
          spriteAtlas={spriteAtlasJson}
        />
        <MainButton onClick={handleGoToLaboratory}>Лаборатория</MainButton>
      </main>
    </div>
  );
});

export default CreateMonster;
