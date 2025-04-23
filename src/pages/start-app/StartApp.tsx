import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import errorStore from "../../stores/ErrorStore";
import userStore from "../../stores/UserStore";
import { initTelegram } from "../../functions/init-telegram";
import client from "../../api/apolloClient";
import Loading from "../loading/Loading";

const StartApp = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!userStore.isAuthenticated) {
      initTelegram(client)
    }

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

  return <Loading />;
});

export default StartApp;
