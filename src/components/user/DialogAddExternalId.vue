<template>
  <Dialog v-model:visible="visible" modal>
    <form class="space-y-8">

      <span class="p-float-label p-fluid">
        <InputText id="externalId" v-model="newExternalId.externalId" :class="{'p-invalid': errors.externalId}"/>
        <label for="externalId">{{ t('glob.user.externalId') }}*</label>
      </span>


      <span class="p-float-label p-fluid">
        <Dropdown
id="externalIdTypeId" v-model="newExternalId.externalIdTypeId"
                  :class="{'p-invalid': errors.externalIdTypeId}"
                  :options="filteredTypes" option-value="id" :option-label="(data) => t('data.' + data.i18nName)"
        />
        <label for="externalIdTypeId">{{ t('glob.user.externalIdType') }}*</label>
      </span>

    </form>

    <template #header>
      <DialogTitle>
        {{ t('page.user.title.addId') }}
      </DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createId()">
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
import {computed, PropType, reactive, ref} from 'vue'
import {useI18n} from "vue-i18n";
import {object, string} from "yup";

import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import DialogFooter from "@/coreComponents/dialogs/DialogFooter.vue";
import DialogTitle from "@/coreComponents/dialogs/DialogTitle.vue";
import Const from "@/plugins/Constants";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {ExternalId} from "@/types/ExternalId"
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";

const props = defineProps({
  internalId: {type: String as PropType<string>, required: true},
  existingIds: {type: Array as PropType<ExternalId.Id[]>, required: true}
})
const emits = defineEmits(['success'])
const {t} = useI18n()

const authStore = useAuthStore()
const dataStore = useDataStore()
const toast = useToast()

const {handleSubmit, resetForm, errors, useFieldModel} = useForm({
  validationSchema: object({
    externalId: string().required(),
    externalIdTypeId: string().required(),
  })
})
const newExternalId = reactive({
  externalId: useFieldModel('externalId'),
  externalIdTypeId: useFieldModel('externalIdTypeId'),
  internalId: "",
})

const filteredTypes = computed(() => {
  return dataStore.externalIdTypes.filter(t => !props.existingIds?.some(i => i.externalIdTypeId == t.id))
})

const createState = reactive<LoadingState>({state: NaN})
const createId = handleSubmit(() => {
  createState.state = LoadingStates.Loading
  newExternalId.internalId = props.internalId

  axios.request({
    url: '/externalId/user',
    method: 'post',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: newExternalId,
  }).then(() => {
    createState.state = LoadingStates.Loaded
    toast.add({summary: 'Success', life: 5000})
    emits('success')
    setVisibility(false)
  }).catch((response: AxiosError) => {
    createState.state = LoadingStates.Error
    toast.add(fromAxiosError(response))
  })
})

// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref(false)
const setVisibility = (val: boolean) : void => {
  visible.value = val

  resetForm()
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>