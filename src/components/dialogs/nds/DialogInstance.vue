<template>
  <Dialog v-model:visible="visible" modal>
    <form class="space-y-8">

      <span class="p-float-label p-fluid">
        <Dropdown id="ndsActivityTypeId" v-model="newInstance.ndsActivityTypeId"
                  :class="{'p-invalid': errors.ndsActivityTypeId}"
                  :options="dataStore.activityTypes" :optionLabel="t => $t('data.' + t.i18nName)" optionValue="id"/>
        <label for="ndsActivityTypeId">{{ $t('page.activity.type') }}*</label>
      </span>

      <span class="p-float-label p-fluid">
        <Calendar id="date" v-model="newInstance.date" :class="{'p-invalid': errors.date}"
                  :showOnFocus="false" showIcon/>
        <label for="date">{{ $t('page.activity.date') }}*</label>
      </span>

      <span v-if="newInstance.ndsActivityTypeId === 1" class="p-float-label p-fluid">
        <Calendar id="startTime" v-model="newInstance.startTime" :class="{'p-invalid': errors.startTime}"
                  timeOnly :showOnFocus="false" showIcon/>
        <label for="startTime">{{ $t('page.activity.startTime') }}*</label>
      </span>

      <span v-if="newInstance.ndsActivityTypeId === 1" class="p-float-label p-fluid">
        <Dropdown id="duration" v-model="newInstance.duration"
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
        <LoadingBtn full outlined visual-type="primary"
                    :loading="state" @click="createInstance()">
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

import Const from "@/plugins/Constants";
import {useDataStore} from "@/stores/data";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import {useForm} from "vee-validate";
import {date, number, object, string} from "yup";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useRoute} from "vue-router";
import {useToast} from "primevue/usetoast";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";
import DialogFooter from "@/components/dialogs/DialogFooter.vue";
import {Nds} from "@/types/Nds";
import moment from "moment";

const emits = defineEmits(['success'])

const dataStore = useDataStore()
const authStore = useAuthStore()
const toast = useToast()
const route = useRoute()

const durations = [60, 75, 90]

const {handleSubmit, resetForm, errors, useFieldModel} = useForm<Nds.ActivityInstanceReq>({
  validationSchema: object({
    date: date().required(),
    ndsActivityTypeId: number().required(),
    startTime: date().when('ndsActivityTypeId', {
      is: 1,
      then: (schema) => schema.required(),
      otherwise: (schema) =>schema.nullable()
    }),
    duration: number().when('ndsActivityTypeId', {
      is: 1,
      then: (schema) => schema.required(),
      otherwise: (schema) =>schema.nullable()
    }),
    place: string().when('ndsActivityTypeId', {
      is: 1,
      then: (schema) => schema.required(),
      otherwise: (schema) =>schema.nullable()
    }),
  })
})

const newInstance = reactive({
  duration: useFieldModel('duration'),
  place: useFieldModel('place'),
  ndsActivityTypeId: useFieldModel('ndsActivityTypeId'),
  date: useFieldModel('date'),
  startTime: useFieldModel('startTime'),
  ndsActivityId: "",
})

const state = reactive<LoadingState>({state: NaN})

const createInstance = handleSubmit(_ => {
  state.state = LoadingStates.Loading

  // prepare the request and convert date/time to the correct format
  newInstance.ndsActivityId = typeof route.params.id === 'string' ? route.params.id : route.params.id.join('')
  const instanceReq: Nds.ActivityInstanceReq = JSON.parse(JSON.stringify(newInstance))
  instanceReq.date = moment(instanceReq.date).format('YYYY-MM-DD')
  if (instanceReq.startTime) instanceReq.startTime = moment(instanceReq.startTime).format('hh:mm')

  axios.request({
    url: '/nds/activities/' + route.params.id + '/instances',
    method: 'post',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: instanceReq,
  }).then(response => {
    state.state = LoadingStates.Loaded
    toast.add({summary: 'Success', life: 5000})
    emits('success')
    setVisibility(false)
  }).catch(response => {
    state.state = LoadingStates.Error
    toast.add(fromAxiosError(response))
  })
})


// ----------------------------
// dialog visibility management
// ----------------------------
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