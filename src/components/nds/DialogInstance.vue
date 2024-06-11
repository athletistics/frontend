<template>
  <Dialog v-model:visible="visible" modal>
    <form class="space-y-8">

      <span class="p-float-label p-fluid">
        <Dropdown
            id="ndsActivityTypeId" v-model="newInstance.ndsActivityTypeId"
            :class="{'p-invalid': errors.ndsActivityTypeId}"
            :options="dataStore.activityTypes" :option-label="t => $t('data.' + t.i18nName)" option-value="id"/>
        <label for="ndsActivityTypeId">{{ $t('page.activity.type') }}*</label>
      </span>

      <span class="p-float-label p-fluid">
        <Calendar
            id="date" v-model="newInstance.dateObj" :class="{'p-invalid': errors.date}"
            :show-on-focus="false" show-icon/>
        <label for="date">{{ $t('page.activity.date') }}*</label>
      </span>

      <span v-if="newInstance.ndsActivityTypeId === 1" class="p-float-label p-fluid">
        <Calendar
            id="startTime" v-model="newInstance.startTimeObj" :class="{'p-invalid': errors.startTime}"
            time-only :show-on-focus="false" show-icon/>
        <label for="startTime">{{ $t('page.activity.startTime') }}*</label>
      </span>

      <span v-if="newInstance.ndsActivityTypeId === 1" class="p-float-label p-fluid">
        <Dropdown
            id="duration" v-model="newInstance.duration"
            :options="durations" :class="{'p-invalid': errors.duration}"/>
        <label for="duration">{{ $t('page.activity.duration') }}*</label>
      </span>

      <span v-if="newInstance.ndsActivityTypeId === 1" class="p-float-label p-fluid">
        <InputText id="place" v-model="newInstance.place" :class="{'p-invalid': errors.place}"/>
        <label for="place">{{ $t('page.activity.place') }}*</label>
      </span>

    </form>

    <template #header>
      <DialogTitle>
        {{ $t('page.activity.title.new') }}
      </DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn
            full outlined visual-type="primary"
            :loading="state" @click="createInstance()">
          {{ $t('glob.btn.create') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </DialogFooter>
    </template>

  </Dialog>

</template>

<script setup lang="ts">
import axios, {AxiosError} from "axios";
import moment from "moment";
import {useToast} from "primevue/usetoast";
import {useForm} from "vee-validate";
import {reactive, ref} from 'vue'
import {useRoute} from "vue-router";
import {date, number, object, string} from "yup";

import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import DialogFooter from "@/coreComponents/dialogs/DialogFooter.vue";
import DialogTitle from "@/coreComponents/dialogs/DialogTitle.vue";
import Const from "@/plugins/Constants";
import {routeParamToString} from "@/plugins/Helper";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import {Nds} from "@/types/Nds";

const emits = defineEmits(['success'])

const dataStore = useDataStore()
const authStore = useAuthStore()
const toast = useToast()
const route = useRoute()

const durations = [60, 75, 90]

const {handleSubmit, resetForm, errors, defineField} = useForm<Nds.ActivityInstanceReq>({
  validationSchema: object({
    dateObj: date().required(),
    ndsActivityTypeId: number().required(),
    startTime: date().when('ndsActivityTypeId', {
      is: 1,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.nullable()
    }),
    duration: number().when('ndsActivityTypeId', {
      is: 1,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.nullable()
    }),
    place: string().when('ndsActivityTypeId', {
      is: 1,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.nullable()
    }),
  })
})

const newInstance = reactive({
  duration: defineField('duration')[0],
  place: defineField('place')[0],
  ndsActivityTypeId: defineField('ndsActivityTypeId')[0],
  dateObj: defineField('dateObj')[0],
  date: string,
  startTimeObj: defineField('startTimeObj')[0],
  startTime: string,
  ndsActivityId: "",
})

const state = reactive<LoadingState>({state: NaN})

const createInstance = handleSubmit(() => {
  state.state = LoadingStates.Loading

  // prepare the request and convert date/time to the correct format
  newInstance.ndsActivityId = routeParamToString(route.params.id)
  const instanceReq: Nds.ActivityInstanceReq = JSON.parse(JSON.stringify(newInstance)) as Nds.ActivityInstanceReq
  instanceReq.date = moment(instanceReq.dateObj).format('YYYY-MM-DD')
  if (instanceReq.startTime) instanceReq.startTime = moment(instanceReq.startTimeObj).format('hh:mm')

  axios.request({
    url: '/nds/activities/' + routeParamToString(route.params.id) + '/instances',
    method: 'post',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: instanceReq,
  }).then(() => {
    state.state = LoadingStates.Loaded
    toast.add({summary: 'Success', life: 5000})
    emits('success')
    setVisibility(false)
  }).catch((response: AxiosError) => {
    state.state = LoadingStates.Error
    toast.add(fromAxiosError(response))
  })
})


// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref(false)
const setVisibility = (val: boolean): void => {
  visible.value = val

  resetForm()
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>