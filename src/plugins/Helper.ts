import {OPEN_ROUTES} from './Constants'
import {RouteRecordName} from "vue-router";

import moment, {duration} from "moment/moment";
import axios from "axios";
import Const from "./Constants.ts";
import Router from '../router.ts';
import {useMyUserStore} from "../stores/user.ts";
import {useAuthStore} from "../stores/auth.ts";
import {useDataStore} from "../stores/data.ts";

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

export function formatDate(date: string | undefined) {
  if (!date) return ""
  return moment(date).format("DD.MM.Y")
}

export function formatDateForInput(date: string | undefined) {
  if (!date) return ""
  return moment(date).format("Y-MM-DD")
}

export function formatResult(value: string, disciplineId: string): string {

  const dataStore = useDataStore()

  // return value
  if (!dataStore.disciplineMapIsReady) return value
  const discipline = dataStore.disciplineMap.get(disciplineId)

  if (!discipline) return value
  const numValue = Number.parseFloat(value)

  // const d = moment.utc(duration(value).as('second'))
  const d = moment.utc(duration(value, 'seconds').as('millisecond'))

  switch (true) {
    case discipline.isDescending:
      return numValue.toFixed(2) + 'm'
    case numValue < 60:
      return d.format("s.SS") + 's'
    case numValue < 60 * 60:
      return d.format("m:ss.SS") + 's'
    default:
      return d.format("h:mm:ss.SS") + 's'
  }
}

export function isRouteProtected(route: RouteRecordName | null | undefined): boolean {
  for (let i = 0; i < OPEN_ROUTES.length; i++) {
    // @ts-ignore
    if (OPEN_ROUTES[i] == route?.name) {
      return false
    }
  }
  return true
}