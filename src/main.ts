import { createApp } from 'vue'
import './style.css'
import './assets/fonts/ArgentumNovus/ArgentumNovus.css'

// font awesome
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons/faBars"
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark"
import {faLockOpen} from "@fortawesome/free-solid-svg-icons/faLockOpen"
import {faArrowRightFromBracket} from "@fortawesome/free-solid-svg-icons/faArrowRightFromBracket"

library.add(faBars, faXmark, faArrowRightFromBracket, faLockOpen)

import App from './App.vue'
import router from './router'
import store from './store/index'

createApp(App)
    .component('font-awesome-icon', FontAwesomeIcon)
    .use(store)
    .use(router)
    .mount('#app')
