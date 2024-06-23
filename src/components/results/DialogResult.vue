<template>
  <Dialog v-model:visible="visible" modal>
    <form ref="resultForm" class="space-y-8">

      <span class="p-float-label p-fluid">
        <InputNumber
            id="value" v-model="newResult.value" v-tooltip="errors.value"
            :class="{'p-invalid': errors.value}" input-id="minmaxfraction" :max-fraction-digits="3" :min="0"
            :max="99999.999"/>
        <label for="value">{{ $t('glob.result.value') }}*</label>
      </span>

      <span v-if="!isPersonalResult" class="p-float-label p-fluid">
        <InputNumber
            id="wind" v-model="newResult.wind" :class="{'p-invalid': errors.wind}"
            input-id="minmaxfraction" :max-fraction-digits="1" :min="-9.9" :max="9.9"/>
        <label for="wind">{{ $t('glob.result.wind') }}</label>
      </span>

      <span v-if="!isPersonalResult" class="p-float-label p-fluid">
        <InputText id="rank" v-model="newResult.rank" :class="{'p-invalid': errors.rank}"/>
        <label for="rank">{{ $t('glob.result.rank') }}</label>
      </span>

      <AutoCompleteUser
          v-if="!isPersonalResult && !isEdit" id="userId" v-model="newResult.userId" v-tooltip="errors.userId"
          :disabled="!!user" :input-class="{'p-invalid': errors.userId}"/>

      <AutoCompleteDiscipline
          v-if="!isEdit" id="disciplineId" v-model="newResult.disciplineId"
          v-tooltip="errors.disciplineId" :input-class="{'p-invalid': errors.disciplineId}"/>

      <AutoCompleteEvent
          v-if="!isPersonalResult && !isEdit" id="eventId" v-model="newResult.eventId" v-tooltip="errors.eventId"
          :disabled="!!event" :input-class="{'p-invalid': errors.eventId}" :is-personal="isPersonal"/>

      <span v-if="isPersonalResult" class="p-float-label p-fluid">
        <Calendar
            id="dateObj" v-model="newResult.dateObj" :class="{'p-invalid': errors.dateObj}"
            :show-on-focus="false" show-icon/>
        <label for="dateObj">{{ t('glob.result.date') }}*</label>
      </span>
    </form>

    <template #header>
      <DialogTitle v-if="isPersonalResult && !isEdit">{{ $t('comp.result.createTraining') }}</DialogTitle>
      <DialogTitle v-else-if="isPersonalResult && isEdit">{{ $t('comp.result.editTraining') }}</DialogTitle>
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
import moment from "moment/moment";
import Dialog from "primevue/dialog";
import {useToast} from "primevue/usetoast";
import {useForm} from 'vee-validate'
import {computed, PropType, reactive, ref} from 'vue'
import {useI18n} from "vue-i18n";
import * as yup from 'yup';

import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import DialogFooter from "@/coreComponents/dialogs/DialogFooter.vue";
import DialogTitle from "@/coreComponents/dialogs/DialogTitle.vue";
import AutoCompleteDiscipline from "@/coreComponents/form/input/AutoCompleteDiscipline.vue";
import AutoCompleteEvent from "@/coreComponents/form/input/AutoCompleteEvent.vue";
import AutoCompleteUser from "@/coreComponents/form/input/AutoCompleteUser.vue";
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
const isPersonalResult = computed((): boolean => props.isPersonal || (props.result ? props.result.isPersonalTrainingResult : false))

// --------------
// import stores
// --------------
const authStore = useAuthStore()
const toast = useToast()
const {t} = useI18n()


// -----------------------------------
// form validation and API interaction
// -----------------------------------
const schema = yup.object({
  value: yup.number().required().positive(),
  wind: yup.number().nullable(),
  rank: yup.string().nullable(),
  disciplineId: yup.string().uuid().required(),
  userId: yup.string().when('isPersonalTrainingResult', {
    is: (val: boolean) => val,
    then: (schema) => schema.nullable(),
    otherwise: (schema) => schema.required()
  }),
  eventId: yup.string().uuid().when('isPersonalTrainingResult', {
    is: (val: boolean) => val,
    then: (schema) => schema.nullable(),
    otherwise: (schema) => schema.required()
  }),
  dateObj: yup.date().when('isPersonalTrainingResult', {
    is: (val: boolean) => val,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.nullable()
  }),
  isPersonalTrainingResult: yup.boolean()
})

const {
  handleSubmit, resetForm, errors, defineField, setValues, meta
} = useForm<Result.RequestBody>({validationSchema: schema, initialValues: {isPersonalTrainingResult: isPersonalResult.value}})
const newResult = reactive({
  value: defineField('value')[0],
  wind: defineField('wind')[0],
  rank: defineField('rank')[0],
  disciplineId: defineField('disciplineId')[0],
  eventId: defineField('eventId')[0],
  userId: defineField('userId')[0],
  dateObj: defineField('dateObj')[0],
  date: "",
})

const createState = reactive<LoadingState>({state: NaN})
const createResult = handleSubmit(() => {
  createState.state = LoadingStates.Loading
  newResult.date = moment(newResult.dateObj as Date).format('YYYY-MM-DD')

  let url = isPersonalResult.value ? "/results/training" : "/results"
  if (isEdit.value) url += "/" + props.result?.id
  const method = isEdit.value ? 'put' : 'post'

  if (isPersonalResult.value) {
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

  if (isEdit.value && props.result?.date) {
    setValues({dateObj: new Date(props.result.date)})
  }

  createState.state = NaN
}


defineExpose({
  setVisibility,
})
</script>

<style scoped>

</style>