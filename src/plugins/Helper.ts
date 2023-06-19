import {OPEN_ROUTES} from './Constants'
import {RouteRecordName} from "vue-router";

import store from '../store'
import moment from "moment";
import axios from "axios";
import Const from "./Constants.ts";

export function checkLoginState() {
    axios.request({
        url: "/me/auth",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
            'Authorization': 'Bearer ' + store.state.token
        }
    }).then(() => {
        // all good, continue
    }).catch(() => {
        // we are logged out!
        store.state.resetUserData()
        this.$router.push('/')
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