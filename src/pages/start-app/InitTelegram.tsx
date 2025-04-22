import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import userStore from "../../stores/UserStore";
import errorStore from "../../stores/ErrorStore";
import { gql, useMutation } from "@apollo/client";

const USER_LOGIN = gql`
  mutation Login($initData: String!, $telegramId: String!) {
    UserLogin(initData: $initData, telegramId: $telegramId) {
      id
      token
      nameProfessor
    }
  }
`;

const InitTelegram = () => {
  const [loginUser] = useMutation(USER_LOGIN);

  useEffect(() => {
    const init = async () => {
      WebApp.ready();

      let tgUser = WebApp.initDataUnsafe?.user;
      let initData = WebApp.initData;

      if (import.meta.env.VITE_LOCAL && (!tgUser || !initData)) {
        tgUser = {
          id: 123456789,
          first_name: "DevUser",
          username: "devuser",
        };

        initData = new URLSearchParams({
          user: JSON.stringify(tgUser),
          chat_instance: "test_chat_instance",
          chat_type: "sender",
          auth_date: Math.floor(Date.now() / 1000).toString(),
          hash: "test_hash",
        }).toString();
      }

      if (tgUser && initData) {
        try {
          const response = await loginUser({
            variables: {
              initData,
              telegramId: String(tgUser.id),
            },
          })

          const user = response.data?.UserLogin;
          if (user?.id) {
            userStore.setUser({
              id: user.id,
              name: tgUser.first_name || tgUser.username || "Unknown",
              nameProfessor: user.nameProfessor,
              token: user.token
            });
          } else {
            errorStore.setError({error: true, message: "Ошибка регистрации"})
          }
        } catch (err) {
          errorStore.setError({error: true, message: "Ошибка регистрации"})
        }
      }

      WebApp.expand();
    };

    init();
  }, [loginUser]);

  return null;
};

export default InitTelegram;
