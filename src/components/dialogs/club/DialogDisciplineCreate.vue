<template>
  <Dialog v-model:visible="visible" modal>
    <form class="space-y-8 with-label">
      <span class="p-float-label p-fluid">
        <InputText id="customName" v-model="newDiscipline.customName"
                   :class="{'p-invalid': errors.customName}" v-tooltip="errors.customName"/>
        <label for="customName">{{ t('page.club.disciplineName') }}</label>
      </span>

      <span class="p-float-label p-fluid">
        <Dropdown id="customName" v-model="newDiscipline.isDescending"
                  :options="disciplineTypes" optionValue="val" optionLabel="name"
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
import {useI18n} from "vue-i18n";
import {ref, reactive} from "vue";

import LoadingBtn from "@/components/button/LoadingBtn.vue";
import DialogFooter from "@/components/dialogs/DialogFooter.vue";
import {useForm} from "vee-validate";
import {object, string, boolean} from "yup";
import LoadingState from "@/types/LoadingState";
import Discipline from "@/types/Discipline";
import {LoadingStates} from "@/types/LoadingStates";
import axios from "axios";
import Const from "@/plugins/Constants";
import {useAuthStore} from "@/stores/auth";
import {useToast} from "primevue/usetoast";
import {fromAxiosError} from "@/plugins/ToastWriter";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";


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
const {handleSubmit, resetForm, errors, useFieldModel} = useForm<Discipline>({
  validationSchema: object({
    customName: string().required().min(3),
    isDescending: boolean().required()
  })
})
const newDiscipline = reactive({
  customName: useFieldModel('customName'),
  isDescending: useFieldModel('isDescending')
})

const createState = reactive<LoadingState>({state: NaN})
const createDiscipline = handleSubmit(_ => {
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
    toast.add({summary: 'Success'})
    emits('success')
  }).catch(error => {
    createState.state = LoadingStates.Error
    toast.add(fromAxiosError(error))
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