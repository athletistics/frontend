<template>
  <Modal ref="modal" classes="lg:max-w-5xl">
    <h3>{{ $t('page.activity.title.new') }}</h3>
    <div class="with-label grid lg:grid-cols-3 sm:grid-cols-2 gap-4">

      <div>
        <label>{{ $t('page.activity.startDate') }}*</label>
        <input v-model="newActivity.startDate" type="date" required>
      </div>

      <div>
        <label>{{ $t('page.activity.endDate') }}*</label>
        <input v-model="newActivity.endDate" type="date" required>
      </div>

      <div>
        <label>{{ $t('page.activity.weekday') }}*</label>
        <select v-model="newActivity.weekday" required>
          <option v-for="(i) in 7" :value="i" selected>{{ $t('glob.weekday[' + i % 7 + ']') }}</option>
        </select>
      </div>

      <div>
        <label>{{ $t('page.activity.startTime') }}*</label>
        <input v-model="newActivity.startTime" type="time" required>
      </div>

      <div>
        <label>{{ $t('page.activity.duration') }}*</label>
        <select v-model="newActivity.duration" required>
          <option :value="60" selected>60</option>
          <option :value="75" selected>75</option>
          <option :value="90" selected>90</option>
        </select>
      </div>

      <div>
        <label>{{ $t('page.activity.place') }}*</label>
        <input v-model="newActivity.place" required>
      </div>

    </div>

    <template #bottom>
      <hr>
      <div class="grid grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createActivity()">
          {{ $t('glob.btn.create') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </div>
    </template>

  </Modal>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import Modal from "../modals/Modal.vue";
import LoadingBtn from "../button/LoadingBtn.vue";
import LabeledText from "../LabeledText.vue";
import LoadingState from "../../types/LoadingState";
import {LoadingStates} from "../../types/LoadingStates";
import axios from "axios";
import Const from "../../plugins/Constants";
import {useToastStore} from "../../stores/toast";
import {useAuthStore} from "../../stores/auth";
import {Nds} from "../../types/Nds";

export default defineComponent({
  name: "ActivityModal",
  components: {LabeledText, LoadingBtn, Modal},
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    return {authStore, toastStore}
  },
  data() {
    return {
      newActivity: {} as Nds.ActivityReq,
      createState: {state: NaN} as LoadingState
    }
  },
  methods: {
    setVisibility(visibility: boolean) {
      (this.$refs.modal as any).setVisibility(visibility)
      this.newActivity = {} as Nds.ActivityReq
    },
    createActivity() {
      this.createState.state = LoadingStates.Loading
      this.newActivity.teamId = typeof this.$route.params.id === 'string' ? this.$route.params.id : this.$route.params.id.join('')

      axios.request({
        url: '/nds/activities',
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newActivity,
      }).then(response => {
        this.createState.state = LoadingStates.Loaded
        this.toastStore.addSuccessToast()
        this.$emit('created')
        this.setVisibility(false)
      }).catch(response => {
        this.createState.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(response)
      })
    }
  }
})
</script>

<style scoped>

</style>