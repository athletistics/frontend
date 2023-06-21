import {OPEN_ROUTES} from './Constants'
import {RouteRecordName} from "vue-router";

import moment from "moment";
import axios from "axios";
import Const from "./Constants.ts";
import Router from '../router.ts';
import {useMyUserStore} from "../stores/user.ts";
import {useAuthStore} from "../stores/auth.ts";

export function checkLoginState() {
    const userStore = useMyUserStore()
    const authStore = useAuthStore()

    axios.request({
        url: "/me/auth",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
            'Authorization': 'Bearer ' + authStore.token
        }
    }).then(() => {
        // all good, continue
    }).catch(() => {
        // we are logged out!
        userStore.$reset()
        authStore.$reset()
        Router.push('/')
    })
}

export function formatDate (date: string | undefined) {
    if (!date) return ""
    return moment(date).format("DD.MM.Y")
}

export function formatDateForInput(date: string | undefined){
    if (!date) return ""
    return moment(date).format("Y-MM-DD")
}

export function  isRouteProtected (route: RouteRecordName | null | undefined): boolean {
    for (let i = 0; i < OPEN_ROUTES.length; i++) {
        // @ts-ignore
        if (OPEN_ROUTES[i] == route?.name) {
            return false
        }
    }
    return true
}