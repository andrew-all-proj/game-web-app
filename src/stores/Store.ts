// src/stores/GameStore.ts
import { makeAutoObservable } from "mobx";

export class GameStore {
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

export const gameStore = new GameStore();
