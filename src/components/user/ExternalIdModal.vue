<template>
  <Modal ref="modal">
    <form class="space-y-4 with-label">
      <h3>{{$t('page.user.title.addId')}}</h3>

      <hr>

      <div>
        <label>{{ $t('glob.user.externalId') }}</label>
        <input v-model="newExternalId.externalId" required>
      </div>

      <div>
        <label>{{ $t('glob.user.externalIdType') }}</label>
        <select v-model="newExternalId.externalIdTypeId">
          <option v-for="t in filteredTypes" :value="t.id">{{ $t('data.' + t.i18nName)}}</option>
        </select>
      </div>

      <hr>

      <div class="grid sm:grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="state" @click="createId">
          {{ $t('glob.btn.add') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </div>

    </form>
  </Modal>
</template>

<script lang="ts">
import axios from "axios";
import {defineComponent, PropType} from 'vue'

import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";
import {useDataStore} from "@/stores/data";

import Const from "@/plugins/Constants";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Modal from "@/components/dialogs/Modal.vue";
import LoadingBtn from "@/components/button/LoadingBtn.vue";

export default defineComponent({
  name: "ExternalIdModal",
  components: {LoadingBtn, Modal},
  props: {
    internalId: {type: String as PropType<string>, required: true},
    existingIds: {type: Array as PropType<ExternalId.Id[]>, required: true}
  },
  emits: ['created'],
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const dataStore = useDataStore()
    return {authStore, toastStore, dataStore}
  },
  data() {
    return {
      newExternalId: {} as ExternalId.Id,
      state: {state: NaN} as LoadingState
    }
  },
  computed: {
    filteredTypes() {
      return this.dataStore.externalIdTypes.filter(t => !this.existingIds?.some(i => i.externalIdTypeId == t.id))
    }
  },
  methods: {
    setVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
      this.newExternalId = {} as ExternalId.Id
    },
    createId(){
      this.state.state = LoadingStates.Loading
      this.newExternalId.internalId = this.internalId

      axios.request({
        url: '/externalId/user',
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newExternalId,
      }).then(response => {
        this.state.state = LoadingStates.Loaded
        this.toastStore.addSuccessToast()
        this.$emit('created')
        this.setVisibility(false)
      }).catch(response => {
        this.state.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(response)
      })
    }
  }
})
</script>

<style scoped>

</style>