import {acceptHMRUpdate, defineStore} from 'pinia'
import Toast from "../types/Toast";
import {AxiosError} from "axios";

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charactersLength = characters.length;
const length = 16

interface State {
  state: string
}

export const useOidcStateStore = defineStore('oidcState', {
  state: (): State => ({
    state: "" as string
  }),
  getters: {},
  actions: {
    createState() {
      let result = '';
      let counter = 0;
      while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
      }
      this.state = result;
    }
  },
  persist: true
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOidcStateStore, import.meta.hot))
}