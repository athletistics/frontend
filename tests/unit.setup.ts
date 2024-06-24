import {config} from "@vue/test-utils";

import enUS from '../src/locales/en-US.json'
import deCH from '../src/locales/de-CH.json'
import {createI18n} from "vue-i18n";

type MessageSchema = typeof enUS

const i18n = createI18n<MessageSchema, 'en-US' | 'de-CH'>({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'de-CH': deCH
  }
})
config.global.plugins = [i18n]