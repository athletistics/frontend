import {createRouter, createWebHistory, RouteLocationNormalized} from 'vue-router'
import store from './store/index'

import Home from "./pages/Home.vue"
import Elevate from "./pages/Elevate.vue"
import Landing from "./pages/Landing.vue"
import Callback from "./pages/Callback.vue"
import Club from "./pages/Club.vue"
import Team from "./pages/Team.vue"
import Athletes from "./pages/Athletes.vue"

import {OPEN_ROUTES} from "./plugins/Constants";
import Me from "./pages/Me.vue";

const routes = [
    {path: '/', name: 'index', component: Landing},
    {path: '/me', name: 'me', component: Me},
    {path: '/home', name: 'home', component: Home},
    {path: '/elevate', name: 'elevate', component: Elevate},
    {path: '/club', name: 'club', component: Club},
    {path: '/callback', name: 'callback', component: Callback},
    {path: '/team/:id', name: 'team', component: Team},
    {path: '/athletes', name: 'athletes', component: Athletes},

    {path: '/:catchAll(.*)', redirect: '/'}
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

function isRouteProtected(route: RouteLocationNormalized) {
    for (let i = 0; i < OPEN_ROUTES.length; i++) {
        // @ts-ignore
        if (OPEN_ROUTES[i] == route?.name) {
            return false
        }
    }
    return true
}

router.beforeEach((to, from) => {
    if (isRouteProtected(to) && !store.getters.getToken) {
        return "/"
    }
})

export default router