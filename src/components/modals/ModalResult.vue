<template>
  <Dialog v-model:visible="visible" modal class="w-full sm:max-w-sm">
    <Form class="space-y-8 " :validation-schema="schema" @submit="createResult" @invalid-submit="console.log('noo')">

      <span class="p-float-label p-fluid">
        <InputNumber name="value" id="value" v-model="newResult.value" :inputClass="{'p-invalid': valueErr}"
                     inputId="minmaxfraction" :maxFractionDigits="3" :min="0"/>
        <label for="value">{{ $t('glob.result.value') }}</label>
      </span>

      <span class="p-float-label p-fluid">
        <InputNumber name="wind" id="wind" v-model="newResult.wind" inputId="minmaxfraction" :maxFractionDigits="1"/>
        <label for="wind">{{ $t('glob.result.wind') }}</label>
      </span>

      <span class="p-float-label p-fluid">
        <InputText name="rank" id="rank" v-model="newResult.rank"/>
        <label for="rank">{{ $t('glob.result.rank') }}</label>
      </span>

      <AutoCompleteUser name="user" v-model="newResult.userId" v-if="!isPersonal" :disabled="!!user"/>

      <AutoCompleteDiscipline name="discipline" v-model="newResult.disciplineId" />

      <AutoCompleteEvent name="event" v-model="newResult.eventId" :disabled="!!event" />

      <LoadingBtn full outlined visual-type="primary" :loading="createState" type="submit">
        {{ $t('glob.btn.add') }}
      </LoadingBtn>
    </Form>

    <template #header>
      <h3 v-if="isPersonal">{{ $t('comp.result.createTraining') }}</h3>
      <h3 v-else>{{ $t('comp.result.create') }}</h3>
    </template>

    <template #footer>
      <div class="grid sm:grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createResult">
          {{ $t('glob.btn.add') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
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
import {Form, useField} from 'vee-validate'
import * as yup from 'yup';

export default defineComponent({
  name: "ModalResult",
  components: {Form, Dialog, AutoCompleteEvent, AutoCompleteDiscipline, AutoCompleteUser, LoadingBtn},
  props: {
    result: {type: Object as PropType<Result.Data | undefined>, default: undefined},
    user: {type: Object as PropType<User | undefined>, default: undefined},
    event: {type: Object as PropType<Event | undefined>, default: undefined},
    isPersonal: {type: Boolean, default: true}
  },
  setup: function () {
    const authStore = useAuthStore()
    const dataStore = useDataStore()
    const toastStore = useToastStore()

    const {errorMessage: valueErr} = useField('value')

    const schema = yup.object().shape({
      value: yup.number().required(),
      // wind: yup.number().optional(),
      // rank: yup.string().optional(),
      // user: yup.string().required(),
      // discipline: yup.string().required(),
      // event: yup.string().required(),
    })

    return {authStore, toastStore, dataStore, schema, valueErr}
  },
  data() {
    return {
      visible: false as boolean,
      events: [] as Event[],
      newResult: {} as Result.RequestBody,
      createState: {state: NaN} as LoadingState
    }
  },
  computed: {
    filteredEvents() {
      if (!this.isPersonal) return this.events
      return this.events.filter(e => e.eventTypeId === 4)
    }
  },
  methods: {
    setVisibility(visible: boolean) {
      this.visible = visible
      this.newResult = {} as Result.RequestBody

      if (this.user) this.newResult.userId = this.user.id
      if (this.event) this.newResult.eventId = this.event.id
    },
    createResult(values) {
      console.log(values)
      console.log(this.newResult)
      return
      this.createState.state = LoadingStates.Loading
      const url = this.isPersonal ? "/me/results" : "/results"

      if (this.isPersonal) {
        delete (this.newResult.userId)
      }

      axios.request({
        url,
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newResult,
      }).then(response => {
        this.createState.state = LoadingStates.Loaded
        this.toastStore.addSuccessToast()
        this.$emit('created')
        this.setVisibility(false)
      }).catch(response => {
        this.createState.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(response)
      })
    },
    getEvents() {
      axios.request({
        url: "/events",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.events = response.data
      }).catch(response => this.toastStore.addToastFromAxiosError(response))
    },
  },
  mounted() {
    this.getEvents()
  }
})
</script>

<style scoped>

</style>