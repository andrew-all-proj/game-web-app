import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import userStore from "../stores/UserStore";

const InitTelegram = () => {
  useEffect(() => {
    WebApp.ready();
    
    if (WebApp.initDataUnsafe?.user) {
      const tgUser = WebApp.initDataUnsafe.user;
      userStore.setUser({
        id: String(tgUser.id),
        name: tgUser.first_name || tgUser.username || "Unknown",
      });
    }

    WebApp.expand();
  }, []);

  return null; 
};

export default InitTelegram;
