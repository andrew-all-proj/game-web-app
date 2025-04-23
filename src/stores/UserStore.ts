import { makeAutoObservable } from "mobx";

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
