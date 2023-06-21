import {createStore, MutationTree, GetterTree} from "vuex"
import createPersistedState from "vuex-persistedstate"
import User from "../types/User";
import Discipline from "../types/Discipline";
import {RootState, State} from "./vuex.ts";

const store = createStore<State>({
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
    mutations: MutationTree<State, RootState> = {
        setToken(state: State, payload: string) {
            state.token = payload
        },
        setUser(state: State, payload: any) {
            state.user = payload
        },
        setHas2Fa(state: State, payload: boolean) {
            state.has2Fa = payload
        },
        set2FaValidated(state: State, payload: boolean) {
            state.is2FaOk = payload
        },
        resetUserData(state: State) {
            state.token = ""
            state.user = {} as User
            state.disciplines = []
            state.is2FaOk = false
            state.has2Fa = false
            state.roles = []
        },
        setUserData(state: State, payload: any) {
            state.has2Fa = payload.has2Fa
            state.is2FaOk = payload.is2FaOk

            let roleSet = new Set<string>()
            for (let i = 0; i < payload.authRoles.length; i++) {
                roleSet.add(payload.authRoles[i].role)
            }

            state.roles = Array.from(roleSet)
        },
        setDisciplines(state: State, payload: any) {
            state.disciplines = payload
        }
    },
    getters: GetterTree<State, RootState> = {
        is2FaOk: (state: State) => {
            return state.is2FaOk
        },
        hasRole: (state: State) => (role: string): boolean => {
            return state.roles.indexOf(role) !== -1
        },
        getToken(state: State) {
            if (!state.token || Object.keys(state.token).length === 0) return undefined
            return state.token
        },
        getUser(state: State) {
            if (!state.user || Object.keys(state.user).length === 0) return undefined
            return state.user
        },
        getDiscipline: (state: State) => (id: number) => {
            if (!state.disciplines || Object.keys(state.disciplines).length === 0) return undefined
            for (let i = 0; i < state.disciplines.length; i++) {
                if (state.disciplines[i].id === id) return state.disciplines[i]
            }
        }
    },
    actions: {
        // logout({commit}) {
        //     commit('setUser', undefined)
        //     commit('setToken', undefined)
        // },
        // loadPersistentData({commit}) {
        //     // todo:  competition types, ...
        // }
    },
    plugins: [createPersistedState()]
})

export default store