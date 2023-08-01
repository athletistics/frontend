<template>
  <Modal ref="modal">
    <h3>{{ $t('page.activity.title.new') }}</h3>
    <div class="with-label grid gap-4">

      <div>
        <label>{{ $t('page.activity.type') }}*</label>
        <select v-model="newInstance.ndsActivityTypeId" required>
          <option v-for="t in dataStore.activityTypes" :value="t.id" selected>{{ $t('data.' + t.i18nName) }}</option>
        </select>
      </div>

      <div>
        <label>{{ $t('page.activity.date') }}*</label>
        <input v-model="newInstance.date" type="date" required>
      </div>

      <div v-if="newInstance.ndsActivityTypeId === 1">
        <label>{{ $t('page.activity.startTime') }}*</label>
        <input v-model="newInstance.startTime" type="time" required>
      </div>

      <div v-if="newInstance.ndsActivityTypeId === 1">
        <label>{{ $t('page.activity.duration') }}*</label>
        <select v-model="newInstance.duration" required>
          <option :value="60" selected>60</option>
          <option :value="75" selected>75</option>
          <option :value="90" selected>90</option>
        </select>
      </div>

      <div v-if="newInstance.ndsActivityTypeId === 1">
        <label>{{ $t('page.activity.place') }}*</label>
        <input v-model="newInstance.place" required>
      </div>

    </div>

    <template #bottom>
      <hr>
      <div class="grid grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="state" @click="createInstance()">
          {{ $t('glob.btn.create') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </div>
    </template>

  </Modal>
</template>

<script lang="ts">
import axios from "axios";
import {defineComponent} from 'vue'

import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";

import Const from "@/plugins/Constants";
import {Nds} from "@/types/Nds";
import {useDataStore} from "@/stores/data";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Modal from "@/components/dialogs/Modal.vue";
import LoadingBtn from "@/components/button/LoadingBtn.vue";

export default defineComponent({
  name: "InstanceModal",
  components: {LoadingBtn, Modal},
  emits: ['created'],
  setup() {
    const dataStore = useDataStore()
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    return {dataStore, authStore, toastStore}
  },
  data() {
    return {
      newInstance: {} as Nds.ActivityInstanceReq,
      state: {state: NaN} as LoadingState
    }
  },
  methods: {
    setVisibility(visibility: boolean) {
      (this.$refs.modal as any).setVisibility(visibility)
      this.newInstance = {} as Nds.ActivityInstanceReq
    },
    createInstance() {
      this.state.state = LoadingStates.Loading
      this.newInstance.ndsActivityId = typeof this.$route.params.id === 'string' ? this.$route.params.id : this.$route.params.id.join('')

      axios.request({
        url: '/nds/activities/' + this.$route.params.id + '/instances',
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newInstance,
      }).then(response => {
        this.state.state = LoadingStates.Loaded
        this.toastStore.addSuccessToast()
        this.$emit('created')
        this.setVisibility(false)
      }).catch(response => {
        this.state.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(response)
      })
    }
  }
})
</script>

<style scoped>

</style>