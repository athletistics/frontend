import './style.css'
import './assets/fonts/ArgentumNovus/ArgentumNovus.css'
import 'primeicons/primeicons.css'
import "primevue/resources/themes/lara-light-blue/theme.css";

import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import AutoComplete from "primevue/autocomplete"
import Calendar from 'primevue/calendar';
import Checkbox from "primevue/checkbox";
import PrimeVue from 'primevue/config'
import ContextMenu from 'primevue/contextmenu';
import Dialog from "primevue/dialog";
import Dropdown from 'primevue/dropdown';
import InputMask from 'primevue/inputmask';
import InputNumber from "primevue/inputnumber";
import InputSwitch from 'primevue/inputswitch';
import InputText from "primevue/inputtext";
import Listbox from 'primevue/listbox'
import Menu from 'primevue/menu';
import Paginator from 'primevue/paginator';
import SelectButton from 'primevue/selectbutton';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip'
import {createApp} from 'vue'
// i18n
import {createI18n} from 'vue-i18n'

import deCH from './locales/de-CH.json'
import enUS from './locales/en-US.json'

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
import {faArrowRightFromBracket} from "@fortawesome/free-solid-svg-icons/faArrowRightFromBracket"
import {faBars} from "@fortawesome/free-solid-svg-icons/faBars"
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons/faEllipsisVertical"
import {faFileImport} from "@fortawesome/free-solid-svg-icons/faFileImport"
import {faLockOpen} from "@fortawesome/free-solid-svg-icons/faLockOpen"
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus"
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark"
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

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
    .component('Calendar', Calendar)
    .component('Dropdown', Dropdown)
    .component('InputSwitch', InputSwitch)
    .component('InputMask', InputMask)
    .component('Listbox', Listbox)
    .component('Checkbox', Checkbox)
    .component('Toast', Toast)
    .component('Menu', Menu)
    .component('ContextMenu', ContextMenu)
    .component('Paginator', Paginator)
    .component('SelectButton', SelectButton)
    .directive('Tooltip', Tooltip)
    .use(ToastService)
    .use(PrimeVue)
    .use(pinia)
    .use(i18n)
    .use(router)
    .mount('#app')
