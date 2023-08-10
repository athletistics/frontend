<template>
  <Dialog v-model:visible="visible" modal>
    <form class="space-y-4 with-label">
      <Listbox id="usersToAdd" v-model="usersToAdd.users" filter :filterFields="['firstName','lastName']"
               :options="filteredUsers" optionValue="id" multiple>
        <template #option="user">
          {{user.option.lastName}} {{user.option.firstName}}
        </template>
      </Listbox>
    </form>

    <template #header>
      <DialogTitle>
        {{ asCoach ? t('page.team.addCoachTitle') : t('page.team.addPartTitle') }}
      </DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn full outlined visual-type="primary" :loading="addState" @click="addToTeam()">{{
            $t('glob.btn.add')
          }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </DialogFooter>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import {computed, PropType, reactive, ref} from "vue";
import User from "@/types/User";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";
import {useI18n} from "vue-i18n";
import {useDataStore} from "@/stores/data";
import DialogFooter from "@/components/dialogs/DialogFooter.vue";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import axios from "axios";
import Const from "@/plugins/Constants";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useToast} from "primevue/usetoast";
import {useAuthStore} from "@/stores/auth";
import {useRoute} from "vue-router";
import {useForm} from "vee-validate";

const props = defineProps({
  coaches: {type: Array as PropType<User[]>, required: false},
  athletes: {type: Array as PropType<User[]>, required: false},
  asCoach: {type: Boolean, required: true}
})

const emits = defineEmits(['success'])

const {t} = useI18n()
const route = useRoute()

const dataStore = useDataStore()
const authStore = useAuthStore()
const toast = useToast()

// Find all users that are not yet part of the team
const filteredUsers = computed(() => {
  const users = [] as User[]
  for (let i = 0; i < dataStore.users.length; i++) {
    if (props.athletes?.some(p => p.id === dataStore.users[i].id)) continue
    if (props.coaches?.some(p => p.id === dataStore.users[i].id)) continue
    users.push(dataStore.users[i])
  }
  return users
})

// ---------------
// API interaction
// ---------------
const {handleSubmit, resetForm, useFieldModel} = useForm()

const usersToAdd = reactive({
  users: useFieldModel('usersToAdd')
})
const addState = reactive<LoadingState>({state: NaN})
const addToTeam = handleSubmit(_ => {
  addState.state = LoadingStates.Loading
  axios.request({
    url: "/teams/" + route.params.id + "/participants",
    method: 'post',
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: usersToAdd.users.map((id: string) => {
      return {userId: id, isCoach: props.asCoach}
    })
  }).then(() => {
    addState.state = LoadingStates.Loaded
    setVisibility(false)
    toast.add({summary: "Success", severity: "success"})
    emits('success')
  }).catch(error => {
    addState.state = LoadingStates.Error
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