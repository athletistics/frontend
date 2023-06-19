// allow this.$store globally
// source https://vuex.vuejs.org/guide/migrating-to-4-0-from-3-x.html#typescript-support

import {ComponentCustomProperties} from "vue";
import {Store} from 'vuex'
import User from "../types/User";
import Discipline from "../types/Discipline";

declare module '@vue/runtime-core' {
    interface State {
        token: string
        user: User
        roles: string[]
        has2Fa: boolean
        is2FaOk: boolean
        disciplines: Discipline[]
    }

    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}