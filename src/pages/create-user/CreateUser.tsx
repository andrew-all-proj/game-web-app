import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import headIcon from "../../assets/icon/head-icon.svg"
import bodyIcon from "../../assets/icon/body-icon.svg"
import emotionIcon from "../../assets/icon/emotion-icon.svg"
import userStore from "../../stores/UserStore"
import styles from "./CreateUser.module.css"
import MainButton from "../../components/Button/MainButton"
import { uploadFile } from "../../api/upload-file"
import client from "../../api/apolloClient"
import { USER_UPDATE } from "../../api/graphql/mutation"
import { FILES } from "../../api/graphql/query"
import { FileItem, GraphQLListResponse } from "../../types/GraphResponse"
import { getMaxVersion } from "../../functions/get-max-version"
import { authorizationAndInitTelegram } from "../../functions/authorization-and-init-telegram"

interface PartTypeAvatar {
  part: string;
  icon: string
}

const CreateUser = observer(() => {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [headParts, setHeadParts] = useState<PartTypeAvatar[]>([])
  const [bodyParts, setBodyParts] = useState<PartTypeAvatar[]>([])
  const [emotionParts, setEmotionParts] = useState<PartTypeAvatar[]>([])

  const [headIndex, setHeadIndex] = useState(0)
  const [bodyIndex, setBodyIndex] = useState(0)
  const [emotionIndex, setEmotionIndex] = useState(0)

  const [name, setName] = useState("");
  const [message, setMessage] = useState("")

  const [activeTab, setActiveTab] = useState<"head" | "body" | "emotion">("head")

  useEffect(() => {
  const loadSvgSprite = async () => {
    if (!userStore.user?.id) {
      const auth = await authorizationAndInitTelegram(navigate);
      if (!auth) {navigate("/")}
    }
    setName(userStore.user?.nameProfessor || "")
    try {
      const { data }: { data: { Files: GraphQLListResponse<FileItem> } } =
        await client.query({
          query: FILES,
          variables: {
            limit: 10,
            offset: 0,
            contentType: 'SPRITE_SHEET_USER_AVATAR',
          },
        });

      const spriteFiles = data?.Files?.items?.filter(
        (item) => item.fileType === 'IMAGE' && item.url.endsWith('.svg')
      );

      const spriteFile = getMaxVersion(spriteFiles);

      if (!spriteFile) {
        setMessage("SVG файл спрайта не найден.");
        navigate("/error");
        return;
      }

      const res = await fetch(spriteFile.url);
      const svgText = await res.text();

      const container = document.createElement("div");
      container.style.display = "none";
      container.innerHTML = svgText;
      document.body.appendChild(container);

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      const symbols = Array.from(doc.querySelectorAll("symbol"));

      const heads: PartTypeAvatar[] = [];
      const bodies: PartTypeAvatar[] = [];
      const emotions: PartTypeAvatar[] = [];

      for (const symbol of symbols) {
        const id = symbol.getAttribute("id") || "";
        const match = id.match(/^(head|body|emotion)_icon_(\d+)$/);
        if (!match) continue;

        const [_, type, index] = match;
        const partId = `${type}_${index}`;
        const foundPart = symbols.find((s) => s.getAttribute("id") === partId);
        if (!foundPart) {
          continue;
        }

        const entry = { icon: id, part: partId };
        if (type === "head") heads.push(entry);
        else if (type === "body") bodies.push(entry);
        else if (type === "emotion") emotions.push(entry);
      }

      setHeadParts(heads);
      setBodyParts(bodies);
      setEmotionParts(emotions);
    } catch (err) {
      setMessage("Не удалось загрузить спрайт.");
      navigate("/error");
    }
  };

  loadSvgSprite();
  }, []);


  useEffect(() => {
    drawAvatarToCanvas()
  }, [headIndex, bodyIndex, emotionIndex, headParts, bodyParts, emotionParts])

  const drawAvatarToCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const parts = [
      { id: bodyParts[bodyIndex]?.part, offsetX: 0, offsetY: 95 },
      { id: headParts[headIndex]?.part, offsetX: 0, offsetY: 16 },
      { id: emotionParts[emotionIndex]?.part, offsetX: 7, offsetY: 50 },
    ];

    for (const { id, offsetX = 0, offsetY = 0 } of parts) {
      if (!id) continue;

      const symbol = document.getElementById(id) as unknown as SVGSymbolElement;
      if (!symbol) continue;

      const viewBox = symbol.getAttribute("viewBox");
      if (!viewBox) continue;

      const [, , vbWidth, vbHeight] = viewBox.split(" ").map(Number);

      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
          ${symbol.innerHTML}
        </svg>`;

      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {

          const drawWidth = vbWidth 
          const drawHeight = vbHeight 

          const x = canvas.width / 2 - drawWidth / 2 + offsetX
          const y = 0 + offsetY

          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.src = url;
      });
    }
  };

  const handleSaveAvatar = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setMessage("Пожалуйста, введите имя.");
      return;
    }

    if (
      !headParts[headIndex]?.part ||
      !bodyParts[bodyIndex]?.part ||
      !emotionParts[emotionIndex]?.part
    ) {
      setMessage("Пожалуйста, выберите голову, тело и лицо.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png")
    );

    if (!blob) {
      setMessage("Ошибка при создании изображения.");
      return;
    }

    const formData = new FormData();
    formData.append("file", new File([blob], "avatar.png", { type: "image/png" }));
    formData.append("name", "avatar");
    formData.append("fileType", "IMAGE");
    formData.append("contentType", "AVATAR_PROFESSOR");

    try {
      const resultUploadFile = await uploadFile({
        url: `${import.meta.env.VITE_API_FILE}/upload`,
        formData,
        token: userStore.user?.token,
      });

      const { data } = await client.mutate({
        mutation: USER_UPDATE,
        variables: {
          id: userStore.user?.id,
          nameProfessor: name,
          avatarFileId: resultUploadFile.id || null,
          isRegistered: true,
        },
      })

      if (data?.UserUpdate) {
        userStore.setUser(data.UserUpdate)
        navigate("/laboratory")
      } else {
        setMessage("Аватар загружен, но пользователь не обновлён.");
      }
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
      setMessage("Ошибка загрузки. Попробуйте снова.");
    }
  };


  const renderGrid = (
    parts: PartTypeAvatar[],
    selectedIndex: number,
  onSelect: (i: number) => void
  ) => {
    if (!parts.length) return null;
    const fullParts = [...parts];
    while (fullParts.length < 12) {
      fullParts.push(null as any);
    }

    return (
      <div className={styles.grid}>
        {fullParts.map((part, i) => (
          <div
            key={part?.icon || `empty-${i}`}
            className={`${styles.partItem} ${part && i === selectedIndex ? styles.active : ""}`}
            onClick={() => part && onSelect(i)}
          >
            {part ? (
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.partItemSvg}>
                  <use href={`#${part.icon}`} />
              </svg>
            ) : (
              <div style={{ width: "100%", height: "100%" }} />
            )}
          </div>
          ))}
        </div>
      );
  };

  return (
    <div className={styles.main}>
      <div className={styles.avatarWrapper}>
       <canvas ref={canvasRef} width={142} height={142} className={styles.avatarCanvas}/>
      </div>
      <div className={styles.infoMessage}>
        {message}
        <input className={styles.nameInput} placeholder="_введите Имя" value={name} onChange={(e) => setName(e.target.value)}/>
        <MainButton onClick={handleSaveAvatar}>Сохранить</MainButton>
      </div>

      <div className={styles.selectPart}>
        <div className={styles.tabs}>
          <div className={`${styles.tabIcon} ${activeTab === "head" ? styles.activeTab : ""}`} onClick={() => setActiveTab("head")}>
            <img
              src={headIcon}
              alt="Голова"
              className={styles.tabIconImage}
            />
          </div>
          <div className={`${styles.tabIcon} ${activeTab === "body" ? styles.activeTab : ""}`} onClick={() => setActiveTab("body")}>
            <img
              src={bodyIcon}
              alt="Тело"
              className={styles.tabIconImage}
            />
          </div>
          <div className={`${styles.tabIcon} ${activeTab === "emotion" ? styles.activeTab : ""}`} onClick={() => setActiveTab("emotion")}>
            <img
              src={emotionIcon}
              alt="Волосы"
              className={styles.tabIconImage}
            />
          </div>
        </div>
        <div className={styles.gridWrapper}>
          {activeTab === "head" && renderGrid(headParts, headIndex, setHeadIndex)}
          {activeTab === "body" && renderGrid(bodyParts, bodyIndex, setBodyIndex)}
          {activeTab === "emotion" && renderGrid(emotionParts, emotionIndex, setEmotionIndex)}
        </div>
      </div>
    </div>
  )
})

export default CreateUser
