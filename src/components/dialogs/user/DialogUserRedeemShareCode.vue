<template>
  <Dialog v-model:visible="visible" modal>
    <form form="redeemShareCode" v-if="!userAdded" class="grid gap-4">
      <span class="p-fluid">
        <label for="code">{{ $t('comp.shareUser.descriptionAdd') }}</label>
        <InputMask id="code" v-model="code" mask="********-****-****-****-************"
                   placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/>
      </span>
    </form>

    <div v-else class="grid gap-4">
      <h3>{{ $t('comp.shareUser.title.success') }}</h3>

      <LabeledText label="glob.user.firstName" :text="user?.firstName"/>
      <LabeledText label="glob.user.lastName" :text="user?.lastName"/>
      <LabeledText label="glob.user.birthdate"
                   :text="user?.birthDate ? $d(new Date(user.birthDate)) : undefined"/>

      <LoadingBtn @click="setVisibility(false)" outlined>{{ $t('glob.btn.close') }}</LoadingBtn>
    </div>

    <template #header>
      <DialogTitle v-if="!userAdded">{{ $t('comp.shareUser.title.add') }}</DialogTitle>
      <DialogTitle v-else>{{ $t('comp.shareUser.title.success') }}</DialogTitle>
    </template>

    <template #footer v-if="!userAdded">
      <DialogFooter>
        <LoadingBtn @click="setVisibility(false)" outlined>{{ $t('glob.btn.close') }}</LoadingBtn>
        <LoadingBtn @click="redeem" :loading="state" :disabled="!meta.valid"
                    outlined visual-type="primary">{{
            $t('glob.btn.save')
          }}
        </LoadingBtn>
      </DialogFooter>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import axios from "axios";
import {ref} from 'vue'

import {useAuthStore} from "@/stores/auth";

import Const from "@/plugins/Constants";
import User from "@/types/User";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import LabeledText from "@/components/LabeledText.vue";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";
import {useToast} from "primevue/usetoast";
import {fromAxiosError} from "@/plugins/ToastWriter";
import DialogFooter from "@/components/dialogs/DialogFooter.vue";
import {object, string} from "yup";
import {useForm} from "vee-validate";
import {toTypedSchema} from "@vee-validate/yup";

const emits = defineEmits(['success'])

const toast = useToast()
const authStore = useAuthStore()

const {handleSubmit, resetForm, errors, meta, useFieldModel} = useForm({
  validationSchema: toTypedSchema(object({
    code: string().required().test('', '', (value) => {
          if (!value) return true
          return value.length === value.replaceAll('_', '').length
        }
    )
  }))
})
const code = useFieldModel('code')

const userAdded = ref(false)
const user = ref<User>()
const state = ref<LoadingState>({state: NaN})
const redeem = handleSubmit(values => {
  state.value.state = LoadingStates.Loading

  axios.request({
    url: 'users/share?code=' + values.code, method: 'post', baseURL: Const.API_URL,
    headers: {'Authorization': 'Bearer ' + authStore.token}
  }).then(response => {
    user.value = response.data
    state.value.state = LoadingStates.Loaded;
    emits('success')
    userAdded.value = true
  }).catch(error => {
    toast.add(fromAxiosError(error))
    state.value.state = LoadingStates.Error
  })
})


// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref(false)
const setVisibility = (val: boolean) => {
  visible.value = val

  resetForm()
  user.value = {} as User
  userAdded.value = false
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>