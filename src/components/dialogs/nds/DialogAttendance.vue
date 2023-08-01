<template>
  <Modal ref="modal">
    <h3>{{ $t('page.activity.attendance') }} - {{ instance?.date ? $d(instance.date) : "" }}</h3>
    <h4>{{ $t('page.activity.coaches') }}</h4>

    <ul role="list" class="divide-y divide-slate-200 overflow-hidden">
      <li v-for="a in users.coaches" class="flex px-4 hover:bg-main cursor-pointer main-transition">
        <input class="mr-2 cursor-pointer" :id="a.id" type="checkbox"
               :value="a.id" v-model="selectedCoaches">
        <label class="flex-grow py-3 cursor-pointer" :for="a.id">
          {{ a.lastName }} {{ a.firstName }}
        </label>
      </li>
    </ul>

    <h4>{{ $t('page.activity.athletes') }}</h4>


    <ul role="list" class="divide-y divide-slate-200 overflow-hidden">
      <li v-for="a in users.athletes" class="flex px-4 hover:bg-main cursor-pointer main-transition">
        <input class="mr-2 cursor-pointer" :id="a.id" type="checkbox"
               :value="a.id" v-model="selectedAthletes">
        <label class="flex-grow py-3 cursor-pointer" :for="a.id">
          {{ a.lastName }} {{ a.firstName }}
        </label>
      </li>
    </ul>

    <template #bottom>
      <hr>
      <div class="grid grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="state" @click="updateAttendance()">
          {{ $t('glob.btn.save') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import axios from "axios";
import {defineComponent, PropType} from 'vue'

import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";

import Const from "@/plugins/Constants";
import User from "@/types/User";
import {Nds} from "@/types/Nds";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Modal from "@/components/dialogs/Modal.vue";
import LoadingBtn from "@/components/button/LoadingBtn.vue";

export default defineComponent({
  name: "AttendanceModal",
  components: {LoadingBtn, Modal},
  props: {
    users: {type: Object as PropType<{ coaches: User[], athletes: User[] }>, required: true},
  },
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    return {authStore, toastStore}
  },
  data() {
    return {
      selectedCoaches: [] as string[],
      selectedAthletes: [] as string[],
      state: {state: NaN} as LoadingState,
      instance: {} as Nds.ActivityInstance
    }
  },
  methods: {
    setVisibility(visibility: boolean, instance?: Nds.ActivityInstance) {
      (this.$refs.modal as any).setVisibility(visibility)
      this.selectedCoaches = [] as string[]
      this.selectedAthletes = [] as string[]

      if (instance) this.instance = instance
      if (visibility) this.getAttendance()
    },
    getAttendance() {
      axios.request({
        url: `/nds/activities/${this.$route.params.id}/instances/${this.instance.id}/attendances`,
        method: 'get',
        baseURL: Const.API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then(response => {
        this.selectedCoaches = (response.data as Nds.Attendance[]).filter(a => a.isCoach).map(a => a.userId)
        this.selectedAthletes = (response.data as Nds.Attendance[]).filter(a => !a.isCoach).map(a => a.userId)
      }).catch(e => {
      })
    },
    updateAttendance() {
      this.state.state = LoadingStates.Loading
      const attendances = [] as { isCoach: boolean, userId: string }[]

      attendances.push(...this.selectedCoaches.map(c => {
        return {isCoach: true, userId: c}
      }))
      attendances.push(...this.selectedAthletes.map(c => {
        return {isCoach: false, userId: c}
      }))

      axios.request({
        url: `/nds/activities/${this.$route.params.id}/instances/${this.instance.id}/attendances`,
        method: 'put',
        baseURL: Const.API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token},
        data: attendances
      }).then(() => {
        this.state.state = LoadingStates.Loaded
        this.toastStore.addSuccessToast()
        this.setVisibility(false)
      }).catch(e => {
        this.state.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(e)
      })
    }
  }
})
</script>

<style scoped>

</style>