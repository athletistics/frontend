import {acceptHMRUpdate, defineStore} from 'pinia'
import User from "../types/User";
import axios from "axios";
import Const from "../plugins/Constants";
import {useAuthStore} from "./auth";

interface State {
  user: User,
  roles: string[]
}

export const useMyUserStore = defineStore('myUser', {
  state: (): State => ({
    user: {} as User,
    roles: [] as string[]
  }),
  getters: {
    hasRole(state) {
      return (role: string) => {
        return state.roles.indexOf(role) !== -1
      }
    }
  },
  actions: {
    updateFromServer() {
      const authStore = useAuthStore()
      if (!authStore.token) return

      axios.request({
        url: "/me",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + authStore.token
        }
      }).then(response => {
        this.user = response.data
      })
    },
    setRoles(roles: { club: string, role: string }[]) {
      const roleSet = new Set<string>()

      for (let i = 0; i < roles.length; i++) {
        roleSet.add(roles[i].role)
      }

      this.roles = Array.from(roleSet)
    },
    setUser(u: User) {
      this.user = u
    },
    clearUser() {
      this.$reset()
    }
  },
  persist: true
})

if(import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMyUserStore, import.meta.hot))
}