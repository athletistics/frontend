// allow this.$store globally
// source https://vuex.vuejs.org/guide/migrating-to-4-0-from-3-x.html#typescript-support

import {Store} from 'vuex'
import User from "../types/User";
import Discipline from "../types/Discipline";

export interface State {
    token: string
    user: User
    roles: string[]
    has2Fa: boolean
    is2FaOk: boolean
    disciplines: Discipline[]
}

export interface RootState{
    version: string
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}