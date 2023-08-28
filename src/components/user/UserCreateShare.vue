<template>
  <LoadingBtn :loading="state" @click="getCode">{{ $t('comp.shareUser.share') }}</LoadingBtn>

  <Dialog v-model:visible="visible" modal>
    <form class="space-y-8">

      <label for="code">{{ $t('comp.shareUser.description') }}</label>
      <div class="p-inputgroup flex-1">
        <InputText id="code" disabled v-model="code.code"/>
        <Button icon="pi pi-copy" @click="copyCode" severity="secondary" />
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
import axios from "axios";
import {PropType, reactive, ref} from 'vue'

import {useAuthStore} from "@/stores/auth";

import Const from "@/plugins/Constants";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import {useToast} from "primevue/usetoast";
import {fromAxiosError} from "@/plugins/ToastWriter";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";
import {useI18n} from "vue-i18n";
import Button from "primevue/button";

const props = defineProps({
  user: {type: String as PropType<string>, required: true}
})

const authStore = useAuthStore()
const toast = useToast()
const {t} = useI18n()


const state = reactive<LoadingState>({state: NaN})
const code = ref({code: ""})

const getCode = () => {
  state.state = LoadingStates.Loading

  axios.request({
    url: 'users/share?userId=' + props.user, method: 'get', baseURL: Const.API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then(response => {
    code.value = response.data
    state.state = LoadingStates.Loaded
    setVisibility(true)
  }).catch(error => {
    toast.add(fromAxiosError(error))
    state.state = LoadingStates.Error
  })
}

const copyCode = () => {
  navigator.clipboard.writeText(code.value.code)
  toast.add({summary: 'Success', life: 2000, severity: "success"})
}

// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref(false)
const setVisibility = (val: boolean) => {
  visible.value = val

  if (!val) code.value = {code: ""}
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>