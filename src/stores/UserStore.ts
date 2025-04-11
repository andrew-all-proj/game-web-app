import { makeAutoObservable } from "mobx";

export interface User {
  id: string;
  name: string;
}

class UserStore {
  user: User | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user: User) {
    this.user = user;
  }

  clearUser() {
    this.user = null;
  }

  get isAuthenticated() {
    return this.user !== null;
  }
}

const userStore = new UserStore();
export default userStore;
