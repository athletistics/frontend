<template>
  <Dialog v-model:visible="visible" modal class="w-11/12 sm:max-w-sm">
    <form class="space-y-8" ref="resultForm">

      <span class="p-float-label p-fluid">
        <InputNumber id="value" v-model="newResult.value" :class="{'p-invalid': errors.value}"
                     inputId="minmaxfraction" :maxFractionDigits="3" :min="0" :max="99999.999"/>
        <label for="value">{{ $t('glob.result.value') }}</label>
      </span>

      <span class="p-float-label p-fluid">
        <InputNumber id="wind" v-model="newResult.wind" :class="{'p-invalid': errors.wind}"
                     inputId="minmaxfraction" :maxFractionDigits="1" :min="-9.9" :max="9.9"/>
        <pre>{{errors.wind}}</pre>
        <label for="wind">{{ $t('glob.result.wind') }}</label>
      </span>

      <span class="p-float-label p-fluid">
        <InputText id="rank" v-model="newResult.rank" :class="{'p-invalid': errors.rank}"/>
        <label for="rank">{{ $t('glob.result.rank') }}</label>
      </span>

      <AutoCompleteUser id="userId" v-model="newResult.userId" v-if="!isPersonal" :disabled="!!user"
                        :inputClass="{'p-invalid': errors.userId}"/>

      <AutoCompleteDiscipline id="disciplineId" v-model="newResult.disciplineId"
                              :inputClass="{'p-invalid': errors.disciplineId}"/>

      <AutoCompleteEvent id="eventId" v-model="newResult.eventId" :disabled="!!event"
                         :inputClass="{'p-invalid': errors.eventId}" :isPersonal="isPersonal"/>
    </form>

    <template #header>
      <h3 v-if="isPersonal">{{ $t('comp.result.createTraining') }}</h3>
      <h3 v-else>{{ $t('comp.result.create') }}</h3>
    </template>

    <template #footer>
      <div class="grid sm:grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createResult" :disabled="!meta.valid">
          {{ $t('glob.btn.add') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import {computed, defineComponent, onMounted, PropType, reactive, ref} from 'vue'
import axios from "axios";
import Const from "../../plugins/Constants";
import {useAuthStore} from "../../stores/auth";
import {useDataStore} from "../../stores/data";
import {useToastStore} from "../../stores/toast";
import Event from "../../types/Event";
import User from "../../types/User";
import LoadingBtn from "../button/LoadingBtn.vue";
import LoadingState from "../../types/LoadingState";
import {LoadingStates} from "../../types/LoadingStates";
import AutoCompleteUser from "../form/input/AutoCompleteUser.vue";
import AutoCompleteDiscipline from "../form/input/AutoCompleteDiscipline.vue";
import AutoCompleteEvent from "../form/input/AutoCompleteEvent.vue";
import Dialog from "primevue/dialog";
import {useField, useForm} from 'vee-validate'
import * as yup from 'yup';

const emits = defineEmits(['created'])
const props = defineProps({
  result: {type: Object as PropType<Result.Data | undefined>, default: undefined},
  user: {type: Object as PropType<User | undefined>, default: undefined},
  event: {type: Object as PropType<Event | undefined>, default: undefined},
  isPersonal: {type: Boolean, default: true}
})

const components =
  {
    Dialog, AutoCompleteEvent, AutoCompleteDiscipline, AutoCompleteUser, LoadingBtn
  }

// --------------
// import stores
// --------------
const authStore = useAuthStore()
const dataStore = useDataStore()
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
const createResult = handleSubmit(_ => {
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
  }).then(response => {
    createState.state = LoadingStates.Loaded
    toastStore.addSuccessToast()
    emits('created')
    setVisibility(false)
  }).catch(response => {
    createState.state = LoadingStates.Error
    toastStore.addToastFromAxiosError(response)
  })
})


// -------------------
// modal management
// -------------------
const visible = ref(false)
const setVisibility = (val: boolean) => {
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