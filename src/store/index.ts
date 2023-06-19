import {createStore} from "vuex"
import createPersistedState from "vuex-persistedstate"
import axios from "axios"
import User from "../types/User";
import Discipline from "../types/Discipline";
import Const from "../plugins/Constants";

const store = createStore({
    state() {
        return {
            token: "",
            user: {} as User,
            disciplines: [] as Discipline[],
            is2FaOk: false,
            has2Fa: false,
            roles: [] as string[]
        }
    },
    mutations: {
        setToken(state, payload: any) {
            state.token = payload
        },
        setUser(state, payload: any) {
            state.user = payload
        },
        setHas2Fa(state, payload: any) {
            state.has2Fa = payload
        },
        set2FaValidated(state, payload: any) {
            state.is2FaOk = payload
        },
        resetUserData(state) {
            state.token = ""
            state.user = {}
            state.disciplines = []
            state.is2FaOk = false
            state.has2Fa = false
            state.roles = []
        },
        setUserData(state, payload: any) {
            state.has2Fa = payload.has2Fa
            state.is2FaOk = payload.is2FaOk

            let roleSet = new Set<string>()
            for (let i = 0; i < payload.authRoles.length; i++) {
                roleSet.add(payload.authRoles[i].role)
            }

            state.roles = Array.from(roleSet)
        },
        setDisciplines(state, payload: any) {
            state.disciplines = payload
        }
    },
    getters: {
        is2FaOk: (state) => {
            return state.is2FaOk
        },
        hasRole: (state) => (role: string): boolean => {
            return state.roles.indexOf(role) !== -1
        },
        getToken(state) {
            if (!state.token || Object.keys(state.token).length === 0) return undefined
            return state.token
        },
        getUser(state) {
            if (!state.user || Object.keys(state.user).length === 0) return undefined
            return state.user
        },
        getDiscipline: (state) => (id: number) => {
            if (!state.disciplines || Object.keys(state.disciplines).length === 0) return undefined
            for (let i = 0; i < state.disciplines.length; i++) {
                if (state.disciplines[i].id === id) return state.disciplines[i]
            }
        }
    },
    actions: {
        logout({commit}) {
            commit('setUser', undefined)
            commit('setToken', undefined)
        },
        loadPersistentData({commit}) {
            axios.request({
                url: "/disciplines",
                method: 'get',
                baseURL: Const.API_URL,
                headers: {
                    'Authorization': 'Bearer ' + this.state.token
                }
            }).then(response => {
                commit('setDisciplines', response.data)
            }).catch(reason => {
                console.log(reason)
            })

            // todo:  competition types, ...
        }
    },
    plugins: [createPersistedState()]
})

export default store