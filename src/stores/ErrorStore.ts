import { makeAutoObservable } from "mobx";

export interface ErrorInterface {
  error: boolean;
  message: string;
}

class ErrorStore {
  error: ErrorInterface | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setError(error: ErrorInterface) {
    this.error = error;
  }

  clearError() {
    this.error = null;
  }

  get isError() {
    return this.error?.error;
  }
}

const errorStore = new ErrorStore();
export default errorStore;
