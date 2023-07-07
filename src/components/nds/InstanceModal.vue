<template>
  <Modal ref="modal">
    <h3>{{ $t('page.activity.title.new') }}</h3>
    <div class="with-label grid gap-4">

      <div>
        <label>{{ $t('page.activity.weekday') }}*</label>
        <select v-model="newInstance.ndsActivityTypeId" required>
          <option :value="0" selected>Comp</option>
          <option :value="1" selected>Train</option>
        </select>
      </div>

      <div>
        <label>{{ $t('page.activity.date') }}*</label>
        <input v-model="newInstance.date" type="date" required>
      </div>

      <div>
        <label>{{ $t('page.activity.startTime') }}*</label>
        <input v-model="newInstance.startTime" type="time" required>
      </div>

      <div>
        <label>{{ $t('page.activity.duration') }}*</label>
        <select v-model="newInstance.duration" required>
          <option :value="60" selected>60</option>
          <option :value="75" selected>75</option>
          <option :value="90" selected>90</option>
        </select>
      </div>

      <div>
        <label>{{ $t('page.activity.place') }}*</label>
        <input v-model="newInstance.place" required>
      </div>

    </div>

    <template #bottom>
      <hr>
      <div class="grid grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="state" @click="createInstance()">
          {{ $t('glob.btn.create') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </div>
    </template>

  </Modal>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import Modal from "../modals/Modal.vue";
import LoadingBtn from "../button/LoadingBtn.vue";
import LoadingState from "../../types/LoadingState";

export default defineComponent({
  name: "InstanceModal",
  components: {LoadingBtn, Modal},
  data() {
    return {
      newInstance: [] as Nds.ActivityInstanceReq,
      state: {state: NaN} as LoadingState
    }
  },
  methods: {
    setVisibility(visibility: boolean) {
      (this.$refs.modal as any).setVisibility(visibility)
      this.newInstance = {} as Nds.ActivityInstanceReq
    },
    createInstance() {
      this.setVisibility(false)
      this.$emit("created")
    }
  }
})
</script>

<style scoped>

</style>