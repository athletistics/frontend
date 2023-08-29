<template>
  <Dialog v-model:visible="visible" modal>
    <form ref="resultForm" class="space-y-8">

      <span class="p-float-label p-fluid">
        <InputNumber
id="value" v-model="newResult.value" v-tooltip="errors.value"
                     :class="{'p-invalid': errors.value}" input-id="minmaxfraction" :max-fraction-digits="3" :min="0"
                     :max="99999.999"/>
        <label for="value">{{ $t('glob.result.value') }}</label>
      </span>

      <span class="p-float-label p-fluid">
        <InputNumber
id="wind" v-model="newResult.wind" :class="{'p-invalid': errors.wind}"
                     input-id="minmaxfraction" :max-fraction-digits="1" :min="-9.9" :max="9.9"/>
        <label for="wind">{{ $t('glob.result.wind') }}</label>
      </span>

      <span class="p-float-label p-fluid">
        <InputText id="rank" v-model="newResult.rank" :class="{'p-invalid': errors.rank}"/>
        <label for="rank">{{ $t('glob.result.rank') }}</label>
      </span>

      <AutoCompleteUser
v-if="!isPersonal" id="userId" v-model="newResult.userId" v-tooltip="errors.userId"
                        :disabled="!!user" :input-class="{'p-invalid': errors.userId}"/>

      <AutoCompleteDiscipline
id="disciplineId" v-model="newResult.disciplineId"
                              v-tooltip="errors.disciplineId" :input-class="{'p-invalid': errors.disciplineId}"/>

      <AutoCompleteEvent
id="eventId" v-model="newResult.eventId" v-tooltip="errors.eventId"
                         :disabled="!!event" :input-class="{'p-invalid': errors.eventId}" :is-personal="isPersonal"/>
    </form>

    <template #header>
      <DialogTitle v-if="isPersonal">{{ $t('comp.result.createTraining') }}</DialogTitle>
      <DialogTitle v-else>{{ $t('comp.result.create') }}</DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn full outlined visual-type="primary" :loading="createState" :disabled="!meta.valid" @click="createResult">
          {{ $t('glob.btn.add') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </DialogFooter>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import axios, {AxiosError} from "axios";
import Dialog from "primevue/dialog";
import {useForm} from 'vee-validate'
import {PropType, reactive, ref} from 'vue'
import * as yup from 'yup';

import LoadingBtn from "@/components/button/LoadingBtn.vue";
import DialogFooter from "@/components/dialogs/DialogFooter.vue";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";
import AutoCompleteDiscipline from "@/components/form/input/AutoCompleteDiscipline.vue";
import AutoCompleteEvent from "@/components/form/input/AutoCompleteEvent.vue";
import AutoCompleteUser from "@/components/form/input/AutoCompleteUser.vue";
import Const from "@/plugins/Constants";
import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";
import Event from "@/types/Event";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import User from "@/types/User";

const emits = defineEmits(['created'])
const props = defineProps({
  result: {type: Object as PropType<Result.Data | undefined>, default: undefined},
  user: {type: Object as PropType<User | undefined>, default: undefined},
  event: {type: Object as PropType<Event | undefined>, default: undefined},
  isPersonal: {type: Boolean, default: true}
})

// --------------
// import stores
// --------------
const authStore = useAuthStore()
const toastStore = useToastStore()


// -----------------------------------
// form validation and API interaction
// -----------------------------------
const schema = yup.object({
  value: yup.number().required().positive(),
  wind: yup.number().nullable(),
  rank: yup.string(),
  disciplineId: yup.string().required().uuid(),
  userId: yup.string().required(),
  eventId: yup.string().required().uuid(),
})

const {
  handleSubmit, resetForm, errors, useFieldModel, setValues, meta
} = useForm<Result.RequestBody>({validationSchema: schema})
const newResult = reactive({
  value: useFieldModel('value'),
  wind: useFieldModel('wind'),
  rank: useFieldModel('rank'),
  disciplineId: useFieldModel('disciplineId'),
  eventId: useFieldModel('eventId'),
  userId: useFieldModel('userId'),
})

const createState = reactive<LoadingState>({state: NaN})
const createResult = handleSubmit(() => {
  createState.state = LoadingStates.Loading
  const url = props.isPersonal ? "/me/results" : "/results"

  if (props.isPersonal) {
    delete (newResult.userId)
  }

  axios.request({
    url,
    method: 'post',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: newResult,
  }).then(() => {
    createState.state = LoadingStates.Loaded
    toastStore.addSuccessToast()
    emits('created')
    setVisibility(false)
  }).catch((response: AxiosError) => {
    createState.state = LoadingStates.Error
    toastStore.addToastFromAxiosError(response)
  })
})


// -------------------
// modal management
// -------------------
const visible = ref(false)
const setVisibility = (val: boolean) : void => {
  visible.value = val
  resetForm()

  if (props.user) setValues({userId: props.user.id})
  if (props.event) setValues({eventId: props.event.id})

  createState.state = NaN
}


defineExpose({
  setVisibility,
})
</script>

<style scoped>

</style>