import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import errorStore from "../../stores/ErrorStore";
import userStore from "../../stores/UserStore";
import InitTelegram from "./InitTelegram";
import Loading from "../loading/Loading";

const StartApp = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (errorStore.error?.error) {
        navigate("/error");
      } else if (userStore.user?.nameProfessor) {
        navigate("/laboratory");
      } else {
        navigate("/create-user");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <InitTelegram />
      <Loading />
    </>
  );
});

export default StartApp;
