<template>
  <Dialog v-model:visible="visible" modal>
    <form ref="activityCreateForm">
      <div class="space-y-8">

        <span class="p-float-label p-fluid">
          <Calendar id="startDate" selectionMode="range" :manualInput="false"
                    v-model="newActivity.dates" :class="{'p-invalid': errors.dates}"/>
          <label for="startDate">{{ $t('page.activity.startDate') }}*</label>
        </span>

        <span class="p-float-label p-fluid">
          <Dropdown id="weekday" v-model="newActivity.weekday" :options="weekdays">
            <template #option="weekday">
              {{ $t('glob.weekday[' + weekday.option % 7 + ']') }}
            </template>
            <template #value="weekday">
              {{ weekday.value ? $t('glob.weekday[' + weekday.value % 7 + ']') : "&nbsp;" }}
            </template>
          </Dropdown>
          <label for="weekday">{{ $t('page.activity.weekday') }}*</label>
        </span>

        <span class="p-float-label p-fluid">
          <Calendar id="startTimeObj" v-model="newActivity.startTimeObj" :class="{'p-invalid': errors.startTimeObj}"
                    timeOnly :showOnFocus="false" showIcon/>
          <label for="startTimeObj">{{ $t('page.activity.startTime') }}*</label>
        </span>

        <span class="p-float-label p-fluid">
          <Dropdown id="duration" v-model="newActivity.duration" :options="durations"/>
          <label for="duration">{{ $t('page.activity.duration') }}*</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText id="place" v-model="newActivity.place" :class="{'p-invalid': errors.place}"/>
          <label for="place">{{ $t('page.activity.place') }}*</label>
        </span>

      </div>
    </form>

    <template #header>
      <DialogTitle>{{ $t('page.activity.title.new') }}</DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn full outlined visual-type="primary"
                    :loading="createState" @click="createActivity()" :disabled="!meta.valid">
          {{ $t('glob.btn.create') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </DialogFooter>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import axios from "axios";
import {reactive, ref} from 'vue'

import {useAuthStore} from "@/stores/auth";

import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Const from "@/plugins/Constants";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";
import DialogFooter from "@/components/dialogs/DialogFooter.vue";
import {useToast} from "primevue/usetoast";
import {useRoute} from "vue-router";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useForm} from "vee-validate";
import {date, number, object, string, array} from "yup";
import {toTypedSchema} from "@vee-validate/yup";
import moment from "moment/moment";

const emits = defineEmits(['success'])

// data
const authStore = useAuthStore()
const toast = useToast()
const route = useRoute()
const durations = [60, 75, 90]
const weekdays = [1, 2, 3, 4, 5, 6, 0]

// ---------------
// API interaction
// ---------------
const {handleSubmit, resetForm, errors, useFieldModel, meta} = useForm({
  validationSchema: toTypedSchema(object({
    dates: array().length(2),
    startTimeObj: date().required(),
    duration: number().required(),
    weekday: number().required().max(6).min(0),
    place: string().required(),
  }))
})
const newActivity = reactive({
  dates: useFieldModel('dates'),
  startDate: "",
  endDate: "",
  startTimeObj: useFieldModel('startTimeObj'),
  startTime: ref<string>(),
  duration: useFieldModel('duration'),
  weekday: useFieldModel('weekday'),
  place: useFieldModel('place'),
  teamId: "",
})
const createState = reactive<LoadingState>({state: NaN})
const createActivity = handleSubmit(() => {
  createState.state = LoadingStates.Loading
  newActivity.teamId = typeof route.params.id === 'string' ? route.params.id : route.params.id.join('')

  // correctly format time and date
  if (newActivity.dates) {
    newActivity.startDate = moment(newActivity.dates[0]).format('YYYY-MM-DD')
    newActivity.endDate = moment(newActivity.dates[1]).format('YYYY-MM-DD')
  }
  newActivity.startTime = moment(newActivity.startTimeObj).format('HH:mm')

  axios.request({
    url: '/nds/activities',
    method: 'post',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: newActivity,
  }).then(response => {
    createState.state = LoadingStates.Loaded
    toast.add({summary: "Success", severity: "success"})
    emits('success')
    setVisibility(false)
  }).catch(response => {
    createState.state = LoadingStates.Error
    toast.add(fromAxiosError(response))
  })
})


const visible = ref(false)
const setVisibility = (val: boolean) => {
  visible.value = val
  resetForm()
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>