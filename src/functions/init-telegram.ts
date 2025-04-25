import WebApp from "@twa-dev/sdk";
import userStore from "../stores/UserStore";
import errorStore from "../stores/ErrorStore";

export const initTelegram = async (): Promise<boolean> => {
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
      const userLogin = await userStore.loginUser(initData, tgUser);
      if (!userLogin) {
        errorStore.setError({ error: true, message: "Ошибка регистрации" });
        return false;
      }
    } catch (err) {
      errorStore.setError({ error: true, message: "Ошибка регистрации" });
      return false;
    }
  } else {
    errorStore.setError({
      error: true,
      message: "Игра работает только в телеграме",
    });
    return false;
  }

  WebApp.expand();
  return true;
};
