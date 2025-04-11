import { makeAutoObservable } from "mobx";

export class Store {
  arenaOpened = false;

  constructor() {
    makeAutoObservable(this);
  }

  openArena() {
    this.arenaOpened = true;
  }

  closeArena() {
    this.arenaOpened = false;
  }
}

export const gameStore = new Store();
