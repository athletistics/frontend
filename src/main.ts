import {createApp} from 'vue'

import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import './style.css'
import './assets/fonts/ArgentumNovus/ArgentumNovus.css'

// i18n
import {createI18n} from 'vue-i18n'
import enUS from './locales/en-US.json'
import deCH from './locales/de-CH.json'

type MessageSchema = typeof enUS

const i18n = createI18n<MessageSchema, 'en-US' | 'de-CH'>({
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages: {
        'en-US': enUS,
        'de-CH': deCH
    }
})

// font awesome
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons/faBars"
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus"
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark"
import {faLockOpen} from "@fortawesome/free-solid-svg-icons/faLockOpen"
import {faArrowRightFromBracket} from "@fortawesome/free-solid-svg-icons/faArrowRightFromBracket"

library.add(faBars, faXmark, faArrowRightFromBracket, faLockOpen, faPlus)

import App from './App.vue'
import router from './router'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
    .component('font-awesome-icon', FontAwesomeIcon)
    .use(pinia)
    .use(i18n)
    .use(router)
    .mount('#app')
