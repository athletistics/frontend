import {createRouter, createWebHistory, RouteLocationNormalized} from 'vue-router'

import Activity from "./pages/Activity.vue"
import Athlete from "./pages/Athlete.vue"
import Athletes from "./pages/Athletes.vue"
import Callback from "./pages/Callback.vue"
import Club from "./pages/Club.vue"
import Elevate from "./pages/Elevate.vue"
import Event from "./pages/Event.vue"
import Events from "./pages/Events.vue"
import Home from "./pages/Home.vue"
import Landing from "./pages/Landing.vue"
import References from "./pages/References.vue"
import Results from "./pages/Results.vue"
import Team from "./pages/Team.vue"
import {OPEN_ROUTES, TOTPLESS_ROUTES} from "./plugins/Constants"
import {useAuthStore} from "./stores/auth"

const routes = [
  {path: '/', name: 'index', component: Landing},

  {path: '/me', name: 'me', component: Athlete},
  {path: '/athletes', name: 'athletes', component: Athletes},
  {path: '/athletes/:id', name: 'athlete', component: Athlete},

  {path: '/club', name: 'club', component: Club},
  {path: '/home', name: 'home', component: Home},
  {path: '/events', name: 'events', component: Events},
  {path: '/events/:id', name: 'event', component: Event},

  {path: '/team/:id', name: 'team', component: Team},

  {path: '/elevate', name: 'elevate', component: Elevate},
  {path: '/results', name: 'results', component: Results},
  {path: '/callback', name: 'callback', component: Callback},
  {path: '/references', name: 'references', component: References},

  {path: '/activity/:id', name: 'activity', component: Activity},

  {path: '/:catchAll(.*)', redirect: '/'}
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

function isRouteProtected(route: RouteLocationNormalized): boolean {
  for (let i = 0; i < OPEN_ROUTES.length; i++) {
    // @ts-ignore
    if (OPEN_ROUTES[i] == route?.name) {
      return false
    }
  }
  return true
}

function isRouteTotpProtected(route: RouteLocationNormalized): boolean {
  for (let i = 0; i < TOTPLESS_ROUTES.length; i++) {
    // @ts-ignore
    if (TOTPLESS_ROUTES[i] == route?.name) {
      return false
    }
  }
  return true
}

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  await authStore.updateFromServer()

  if (isRouteProtected(to) && !authStore.token) {
    return "/"
  }

  if (isRouteTotpProtected(to) && !authStore.is2FaOk) {
    return "/elevate"
  }
})

export default router