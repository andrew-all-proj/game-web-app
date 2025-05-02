import styles from "./Loading.module.css";
import { observer } from "mobx-react-lite";
import userStore from "../../stores/UserStore"

const Loading = observer(() => {
  const user = userStore.user;

  return (
    <div className={styles.loadingPage}>
      <div className={styles.spinner} />
      <p>{user ? `${user.nameProfessor }` : 'Загрузка...'}</p>
    </div>
  );
});

export default Loading;
