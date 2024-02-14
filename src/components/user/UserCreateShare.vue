<template>
  <LoadingBtn :loading="state" @click="getCode">{{ $t('comp.shareUser.share') }}</LoadingBtn>

  <Dialog v-model:visible="visible" modal>
    <form class="space-y-8">

      <label for="code">{{ $t('comp.shareUser.description') }}</label>
      <div class="p-inputgroup flex-1">
        <InputText id="code" v-model="code.code" disabled/>
        <Button icon="pi pi-copy" severity="secondary" @click="copyCode"/>
      </div>

    </form>

    <template #header>
      <DialogTitle>
        {{ t('comp.shareUser.title.code') }}
      </DialogTitle>
    </template>

    <template #footer>
      <div class="grid">
        <LoadingBtn full outlined @click="setVisibility(false)">
          {{ t('glob.btn.close') }}
        </LoadingBtn>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import axios, {AxiosError, AxiosResponse} from "axios";
import Button from "primevue/button";
import {useToast} from "primevue/usetoast";
import {PropType, reactive, ref} from 'vue'
import {useI18n} from "vue-i18n";

import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import DialogTitle from "@/coreComponents/dialogs/DialogTitle.vue";
import Const from "@/plugins/Constants";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";

const props = defineProps({
  user: {type: String as PropType<string>, required: true}
})

const authStore = useAuthStore()
const toast = useToast()
const {t} = useI18n()


const state = reactive<LoadingState>({state: NaN})
const code = ref({code: ""})

const getCode = (): void => {
  state.state = LoadingStates.Loading

  axios.request({
    url: 'users/share?userId=' + props.user, method: 'get', baseURL: Const.API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then((response: AxiosResponse<{ code: string }, any>) => {
    code.value = response.data
    state.state = LoadingStates.Loaded
    setVisibility(true)
  }).catch((error: AxiosError) => {
    toast.add(fromAxiosError(error))
    state.state = LoadingStates.Error
  })
}

const copyCode = (): void => {
  void navigator.clipboard.writeText(code.value.code)
  toast.add({summary: 'Success', life: 2000, severity: "success"})
}

// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref(false)
const setVisibility = (val: boolean): void => {
  visible.value = val

  if (!val) code.value = {code: ""}
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>