<template>
  <Dialog v-model:visible="visible" modal>
    <h4>{{ $t('page.activity.coaches') }}</h4>
    <Listbox
        v-model="selectedCoaches" :options="users.coaches" option-value="id" multiple
        :disabled="state.state === LoadingStates.Loading">
      <template #option="user">
        {{ user.option.lastName }} {{ user.option.firstName }}
      </template>
    </Listbox>

    <h4>{{ $t('page.activity.athletes') }}</h4>
    <Listbox
        v-model="selectedAthletes" :options="users.athletes" option-value="id" multiple
        :disabled="state.state === LoadingStates.Loading">
      <template #option="user">
        {{ user.option.lastName }} {{ user.option.firstName }}
      </template>
    </Listbox>

    <template #header>
      <DialogTitle>
        {{ $t('page.activity.attendance') }} - {{ instance?.date ? $d(instance.date) : "" }}
      </DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn full outlined visual-type="primary" :loading="state" @click="updateAttendance()">
          {{ $t('glob.btn.save') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </DialogFooter>
    </template>

  </Dialog>
</template>

<script setup lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import {useToast} from "primevue/usetoast";
import {PropType, reactive, ref} from 'vue'
import {useRoute} from "vue-router";

import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import DialogFooter from "@/coreComponents/dialogs/DialogFooter.vue";
import DialogTitle from "@/coreComponents/dialogs/DialogTitle.vue";
import Const from "@/plugins/Constants";
import {routeParamToString} from "@/plugins/Helper";
import {fromAxiosError, successToast} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import {Nds} from "@/types/Nds";
import User from "@/types/User";

defineProps({
  users: {type: Object as PropType<{ coaches: User[], athletes: User[] }>, required: true},
})

const authStore = useAuthStore()
const toast = useToast()
const route = useRoute()

const selectedCoaches = ref<string[]>([])
const selectedAthletes = ref<string[]>([])
const state = reactive<LoadingState>({state: NaN})
const instance = ref<Nds.ActivityInstance>()

const getAttendance = (): void => {
  if (!instance.value) {
    toast.add({summary: 'No instance selected', life: 3000, severity: "error"})
    return
  }

  state.state = LoadingStates.Loading
  axios.request({
    url: `/nds/activities/${routeParamToString(route.params.id)}/instances/${instance.value.id}/attendances`,
    method: 'get',
    baseURL: Const.API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then((response: AxiosResponse<Nds.Attendance[], any>) => {
    selectedCoaches.value = response.data.filter(a => a.isCoach).map(a => a.userId)
    selectedAthletes.value = response.data.filter(a => !a.isCoach).map(a => a.userId)
  }).catch(() => {
  }).finally(() => {
    state.state = LoadingStates.Loaded
  })
}

const updateAttendance = (): void => {
  if (!instance.value) {
    toast.add({summary: 'No instance selected', life: 3000, severity: "error"})
    return
  }

  state.state = LoadingStates.Loading
  const attendances = [] as { isCoach: boolean, userId: string }[]

  attendances.push(...selectedCoaches.value.map(c => {
    return {isCoach: true, userId: c}
  }))
  attendances.push(...selectedAthletes.value.map(c => {
    return {isCoach: false, userId: c}
  }))

  axios.request({
    url: `/nds/activities/${routeParamToString(route.params.id)}/instances/${instance.value.id}/attendances`,
    method: 'put',
    baseURL: Const.API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token},
    data: attendances
  }).then(() => {
    state.state = LoadingStates.Loaded
    toast.add(successToast())
    setVisibility(false)
  }).catch((e: AxiosError) => {
    state.state = LoadingStates.Error
    toast.add(fromAxiosError(e))
  })
}

// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref<boolean>(false)
const setVisibility = (v: boolean, i?: Nds.ActivityInstance): void => {
  visible.value = v
  selectedCoaches.value = [] as string[]
  selectedAthletes.value = [] as string[]

  if (i) instance.value = i
  if (visible.value) getAttendance()
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>