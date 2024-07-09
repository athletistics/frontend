<template>
  <Dialog v-model:visible="visible" modal>
    <form class="space-y-8">
      <span class="p-float-label p-fluid">
        <InputText
            id="customName" v-model="newDiscipline.customName"
            v-tooltip="errors.customName" :class="{'p-invalid': errors.customName}"/>
        <label for="customName">{{ t('page.club.disciplineName') }}</label>
      </span>

      <span class="p-float-label p-fluid">
        <Dropdown
            id="customName" v-model="newDiscipline.isDescending"
            :options="disciplineTypes" option-value="val" option-label="name"
            :class="{'p-invalid': errors.isDescending}"/>
        <label for="customName">{{ t('page.club.disciplineType') }}</label>
      </span>

    </form>

    <template #header>
      <DialogTitle>
        {{ t('page.club.title.createDiscipline') }}
      </DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createDiscipline()">
          {{ t('glob.btn.save') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">
          {{ t('glob.btn.cancel') }}
        </LoadingBtn>
      </DialogFooter>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import axios, {AxiosError} from "axios";
import {useToast} from "primevue/usetoast";
import {useForm} from "vee-validate";
import {reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {boolean, object, string} from "yup";

import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import DialogFooter from "@/coreComponents/dialogs/DialogFooter.vue";
import DialogTitle from "@/coreComponents/dialogs/DialogTitle.vue";
import Const from "@/plugins/Constants";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import Discipline from "@/types/Discipline";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";


const emits = defineEmits(['success'])
const {t} = useI18n()


// --------------
// import stores
// --------------
const authStore = useAuthStore()
const toast = useToast()
const disciplineTypes = [
  {val: true, name: t('page.club.disciplineTypeAsc')},
  {val: false, name: t('page.club.disciplineTypeDesc')},
]

// ---------------
// API interaction
// ---------------
const {handleSubmit, resetForm, errors, defineField} = useForm<Discipline>({
  validationSchema: object({
    customName: string().required().min(3),
    isDescending: boolean().required()
  })
})
const newDiscipline = reactive({
  customName: defineField('customName')[0],
  isDescending: defineField('isDescending')[0]
})

const createState = reactive<LoadingState>({state: NaN})
const createDiscipline = handleSubmit(() => {
  createState.state = LoadingStates.Loading
  axios.request({
    url: "/disciplines",
    method: 'post',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: newDiscipline
  }).then(() => {
    createState.state = LoadingStates.Loaded
    setVisibility(false)
    toast.add({summary: 'Success', life: 2000, severity: "success"})
    emits('success')
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