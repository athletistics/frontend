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
          v-if="!isPersonal && !isEdit" id="userId" v-model="newResult.userId" v-tooltip="errors.userId"
          :disabled="!!user" :input-class="{'p-invalid': errors.userId}"/>

      <AutoCompleteDiscipline
          v-if="!isEdit" id="disciplineId" v-model="newResult.disciplineId"
          v-tooltip="errors.disciplineId" :input-class="{'p-invalid': errors.disciplineId}"/>

      <AutoCompleteEvent
          v-if="!isEdit" id="eventId" v-model="newResult.eventId" v-tooltip="errors.eventId"
          :disabled="!!event" :input-class="{'p-invalid': errors.eventId}" :is-personal="isPersonal"/>
    </form>

    <template #header>
      <DialogTitle v-if="isPersonal && !isEdit">{{ $t('comp.result.createTraining') }}</DialogTitle>
      <DialogTitle v-else-if="isPersonal && isEdit">{{ $t('comp.result.editTraining') }}</DialogTitle>
      <DialogTitle v-else-if="!isEdit">{{ $t('comp.result.create') }}</DialogTitle>
      <DialogTitle v-else>{{ $t('comp.result.edit') }}</DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn
            full outlined visual-type="primary" :loading="createState" :disabled="!meta.valid"
            @click="createResult">
          {{ isEdit ? $t('glob.btn.save') : $t('glob.btn.add') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </DialogFooter>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import axios, {AxiosError} from "axios";
import Dialog from "primevue/dialog";
import {useToast} from "primevue/usetoast";
import {useForm} from 'vee-validate'
import {computed, PropType, reactive, ref} from 'vue'
import * as yup from 'yup';

import LoadingBtn from "@/components/button/LoadingBtn.vue";
import DialogFooter from "@/components/dialogs/DialogFooter.vue";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";
import AutoCompleteDiscipline from "@/components/form/input/AutoCompleteDiscipline.vue";
import AutoCompleteEvent from "@/components/form/input/AutoCompleteEvent.vue";
import AutoCompleteUser from "@/components/form/input/AutoCompleteUser.vue";
import Const from "@/plugins/Constants";
import {fromAxiosError, successToast} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import Event from "@/types/Event";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import User from "@/types/User";

const emits = defineEmits(['created'])
const props = defineProps({
  result: {type: Object as PropType<Result.RequestBody | undefined>, default: undefined},
  user: {type: Object as PropType<User | undefined>, default: undefined},
  event: {type: Object as PropType<Event | undefined>, default: undefined},
  isPersonal: {type: Boolean, default: true}
})

const isEdit = computed((): boolean => !!props.result)

// --------------
// import stores
// --------------
const authStore = useAuthStore()
const toast = useToast()


// -----------------------------------
// form validation and API interaction
// -----------------------------------
const schema = yup.object({
  value: yup.number().required().positive(),
  wind: yup.number().nullable(),
  rank: yup.string().nullable(),
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
  let url = props.isPersonal ? "/me/results" : "/results"
  if(isEdit.value) url += "/" + props.result?.id
  const method = isEdit.value ? 'put' : 'post'

  if (props.isPersonal) {
    delete (newResult.userId)
  }

  axios.request({
    url, method,
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: newResult,
  }).then(() => {
    createState.state = LoadingStates.Loaded
    toast.add(successToast())
    emits('created')
    setVisibility(false)
  }).catch((response: AxiosError) => {
    createState.state = LoadingStates.Error
    toast.add(fromAxiosError(response))
  })
})

// -------------------
// modal management
// -------------------
const visible = ref(false)
const setVisibility = (val: boolean): void => {
  visible.value = val
  resetForm()

  if (props.result) setValues(props.result)
  else {
    if (props.event) setValues({eventId: props.event.id})
  }

  if (props.user) setValues({userId: props.user.id})

  createState.state = NaN
}


defineExpose({
  setVisibility,
})
</script>

<style scoped>

</style>