import { makeAutoObservable } from "mobx";
import client from "../api/apolloClient";
import { USER_LOGIN } from "../api/graphql/mutation";

export interface User {
  id: string;
  name: string;
  token?: string;
  nameProfessor?: string;
}

class UserStore {
  user: User | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loginUser(initData: any, tgUser: any): Promise<User | null> {
    const response = await client.mutate({
      mutation: USER_LOGIN,
      variables: {
        initData,
        telegramId: String(tgUser.id),
      },
    });

    const user = response.data?.UserLogin;

    if (!user?.id) {
      return null;
    }

    this.setUser({
      id: user.id,
      name: tgUser.first_name || tgUser.username || "Unknown",
      nameProfessor: user.nameProfessor,
      token: user.token,
    });

    return user;
  }

  setUser(user: User) {
    this.user = user;
  }

  clearUser() {
    this.user = null;
  }

  get isAuthenticated() {
    return this.user?.token;
  }
}

const userStore = new UserStore();
export default userStore;
