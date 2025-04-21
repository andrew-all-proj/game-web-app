import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import userStore from "../stores/UserStore";
import { gql, useMutation } from "@apollo/client";

const USER_LOGIN = gql`
  mutation Login($initData: String!, $telegramId: String!) {
    UserLogin(initData: $initData, telegramId: $telegramId) {
      id
    }
  }
`;

const InitTelegram = () => {
  const [loginUser] = useMutation(USER_LOGIN);

  useEffect(() => {
    WebApp.ready();

    const tgUser = WebApp.initDataUnsafe?.user;
    const initData = WebApp.initData;

    if (tgUser && initData) {
      userStore.setUser({
        id: String(tgUser.id),
        name: tgUser.first_name || tgUser.username || "Unknown",
      });

      loginUser({
        variables: {
          initData,
          telegramId: String(tgUser.id),
        },
      }).catch((err) => {
        console.error("Login mutation failed", err);
      });
    }

    WebApp.expand();
  }, [loginUser]);

  return null;
};

export default InitTelegram;
