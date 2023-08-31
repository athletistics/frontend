<template>
  <Dialog v-model:visible="visible" modal>
    <form class="space-y-8">
      <span class="p-float-label p-fluid">
        <InputText id="name" v-model="newEvent.name" :class="{'p-invalid': errors.name}"/>
        <label for="name">{{ t('glob.event.name') }}*</label>
      </span>

      <span class="p-float-label p-fluid">
        <InputText id="place" v-model="newEvent.place" :class="{'p-invalid': errors.place}"/>
        <label for="place">{{ t('glob.event.place') }}*</label>
      </span>

      <span class="p-float-label p-fluid">
        <Calendar
id="dateObj" v-model="newEvent.dateObj" :class="{'p-invalid': errors.dateObj}"
                  :show-on-focus="false" show-icon/>
        <label for="dateObj">{{ t('glob.event.date') }}*</label>
      </span>


      <span class="p-float-label p-fluid">
        <Dropdown
id="eventTypeId" v-model="newEvent.eventTypeId" :class="{'p-invalid': errors.eventTypeId}"
                  :options="dataStore.eventTypes" option-value="id" :option-label="(data) => t('data.' + data.i18nName)"
        />
        <label for="eventTypeId">{{ t('glob.event.type') }}*</label>
      </span>

      <span class="p-float-label p-fluid">
        <Dropdown
id="isOutdoor" v-model="newEvent.isOutdoor" :class="{'p-invalid': errors.isOutdoor}"
                  :options="seasons" option-value="val" option-label="label"
        />
        <label for="isOutdoor">{{ t('glob.event.season') }}*</label>
      </span>

      <span class="flex items-center">
        <Checkbox id="isHomologated" v-model="newEvent.isHomologated" :binary="true"/>
        <label for="isHomologated" class="ml-2">{{ t('glob.event.homologated') }}</label>
      </span>
    </form>

    <template #header>
      <DialogTitle>
        {{ t('page.event.createTitle') }}
      </DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createEvent()">
          {{ t('glob.btn.save') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">
          {{ t('glob.btn.cancel') }}
        </LoadingBtn>
      </DialogFooter>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import axios, {AxiosError} from "axios";
import moment from "moment";
import {useToast} from "primevue/usetoast";
import {useForm} from "vee-validate";
import {reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {boolean, date, number, object, string} from "yup";

import LoadingBtn from "@/components/button/LoadingBtn.vue";
import DialogFooter from "@/components/dialogs/DialogFooter.vue";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";
import Const from "@/plugins/Constants";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";

const emits = defineEmits(['success'])
const {t} = useI18n()

const seasons = [
  {val: false, label: t('glob.event.indoor')},
  {val: true, label: t('glob.event.outdoor')},
]

const authStore = useAuthStore()
const dataStore = useDataStore()
const toast = useToast()

const {handleSubmit, resetForm, errors, useFieldModel} = useForm({
  validationSchema: object({
    eventTypeId: number().required(),
    name: string().required(),
    place: string().required(),
    dateObj: date().required(),
    isOutdoor: boolean().required(),
  })
})
const newEvent = reactive({
  eventTypeId: useFieldModel('eventTypeId'),
  name: useFieldModel('name'),
  place: useFieldModel('place'),
  dateObj: useFieldModel('dateObj'),
  isHomologated: useFieldModel('isHomologated'),
  isOutdoor: useFieldModel('isOutdoor'),
  date: "",
})

const createState = reactive<LoadingState>({state: NaN})
const createEvent = handleSubmit(() => {
  createState.state = LoadingStates.Loading
  newEvent.date = moment(newEvent.dateObj as Date).format('YYYY-MM-DD')

  axios.request({
    url: "/events",
    method: 'post',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: newEvent
  }).then(() => {
    createState.state = LoadingStates.Loaded
    setVisibility(false)
    toast.add({summary: "Success", life: 5000})
    emits('success')
  }).catch((error: AxiosError) => {
    createState.state = LoadingStates.Error
    toast.add(fromAxiosError(error))
  })
})

// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref(false)
const setVisibility = (val: boolean) : void => {
  visible.value = val

  resetForm()
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>