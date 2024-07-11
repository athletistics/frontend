<template>
  <Dialog v-model:visible="visible" modal>
    <form class="space-y-8">
      <span class="p-float-label p-fluid">
        <InputText id="name" v-model="newTeam.name" v-tooltip="errors.name" :class="{'p-invalid': errors.name}"/>
        <label for="name">{{ $t('page.club.teamName') }}</label>
      </span>
    </form>

    <template #header>
      <DialogTitle>{{ $t('page.club.title.createTeam') }}</DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createTeam()">
          {{ $t('glob.btn.save') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">
          {{ $t('glob.btn.cancel') }}
        </LoadingBtn>
      </DialogFooter>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import axios, {AxiosError} from "axios";
import Dialog from "primevue/dialog";
import {useToast} from "primevue/usetoast";
import {useForm} from "vee-validate";
import {reactive, ref} from "vue";
import {object, string} from 'yup';

import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import DialogFooter from "@/coreComponents/dialogs/DialogFooter.vue";
import DialogTitle from "@/coreComponents/dialogs/DialogTitle.vue";
import Const from "@/plugins/Constants";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import {useMyUserStore} from "@/stores/user";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Team from "@/types/Team";

const emits = defineEmits(['success'])

// --------------
// import stores
// --------------
const authStore = useAuthStore()
const userStore = useMyUserStore()
const toast = useToast()

// ---------------
// API interaction
// ---------------
const {handleSubmit, resetForm, errors, defineField} = useForm<Team>({
  validationSchema: object({
    name: string().required().min(3)
  })
})
const newTeam = reactive({
  name: defineField('name')[0]
})

const createState = reactive<LoadingState>({state: NaN})
const createTeam = handleSubmit(() => {
  createState.state = LoadingStates.Loading
  axios.request({
    url: "/club/" + userStore.user.clubId + "/teams",
    method: 'post',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: newTeam
  }).then(() => {
    createState.state = LoadingStates.Loaded
    emits('success')
    setVisibility(false)
  }).catch((error: AxiosError) => {
    createState.state = LoadingStates.Error
    toast.add(fromAxiosError(error))
  })
})

// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref(false)
const setVisibility = (val: boolean): void => {
  visible.value = val

  resetForm()
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>