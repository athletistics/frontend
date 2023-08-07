<template>
  <Dialog v-model:visible="visible" modal>
    <form ref="teamCreateForm">
      <span class="p-float-label p-fluid">
        <InputText id="name" v-model="newTeam.name" :class="{'p-invalid': errors.name}" v-tooltip="errors.name"/>
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

import axios from "axios";
import {reactive, ref} from "vue";
import {object, string} from 'yup';
import {useForm} from "vee-validate";
import Dialog from "primevue/dialog";

import LoadingBtn from "@/components/button/LoadingBtn.vue";
import Team from "@/types/Team";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Const from "@/plugins/Constants";

import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";
import {useMyUserStore} from "@/stores/user";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";
import DialogFooter from "@/components/dialogs/DialogFooter.vue";

const emits = defineEmits(['success'])

// --------------
// import stores
// --------------
const authStore = useAuthStore()
const toastStore = useToastStore()
const userStore = useMyUserStore()

// ---------------
// API interaction
// ---------------
const {handleSubmit, resetForm, errors, useFieldModel} = useForm<Team>({
  validationSchema: object({
    name: string().required().min(3)
  })
})
const newTeam = reactive({
  name: useFieldModel('name')
})

const createState = reactive<LoadingState>({state: NaN})
const createTeam = handleSubmit(_ => {
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
  }).catch(error => {
    createState.state = LoadingStates.Error
    toastStore.addToastFromAxiosError(error)
  })
})

// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref(false)
const setVisibility = (val: boolean) => {
  visible.value = val

  resetForm()
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>