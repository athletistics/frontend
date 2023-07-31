import {createApp} from 'vue'

import './style.css'
import './assets/fonts/ArgentumNovus/ArgentumNovus.css'

import PrimeVue from 'primevue/config'
import AutoComplete from "primevue/autocomplete"
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Dialog from "primevue/dialog";
import Tooltip from 'primevue/tooltip'
import "primevue/resources/themes/mira/theme.css";

import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// i18n
import {createI18n} from 'vue-i18n'
import enUS from './locales/en-US.json'
import deCH from './locales/de-CH.json'

type MessageSchema = typeof enUS

const i18n = createI18n<MessageSchema, 'en-US' | 'de-CH'>({
  legacy: false,
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
import {faFileImport} from "@fortawesome/free-solid-svg-icons/faFileImport"
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons/faEllipsisVertical"
import {faArrowRightFromBracket} from "@fortawesome/free-solid-svg-icons/faArrowRightFromBracket"

library.add(faBars, faXmark, faArrowRightFromBracket, faLockOpen, faPlus, faEllipsisVertical, faFileImport)

import App from './App.vue'
import router from './router'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)


createApp(App)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('AutoComplete', AutoComplete)
  .component('InputText', InputText)
  .component('InputNumber', InputNumber)
  .component('Dialog', Dialog)
  .directive('Tooltip', Tooltip)
  .use(PrimeVue)
  .use(pinia)
  .use(i18n)
  .use(router)
  .mount('#app')
