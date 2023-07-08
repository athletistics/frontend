<template>
  <Modal ref="modal">
    <h3>{{ $t('page.activity.attendance') }} - {{instance?.date ? $d(instance.date) : ""}}</h3>
    <!--    Future update: differentiate between coaches and athletes -->
    <!--    <h4>{{ $t('page.activity.coaches') }}</h4>-->

    <h4>{{ $t('page.activity.athletes') }}</h4>


    <ul role="list" class="divide-y divide-slate-200 overflow-hidden">
      <li v-for="a in athletes" class="flex px-4 hover:bg-main cursor-pointer main-transition">
        <input class="mr-2 cursor-pointer" :id="a.id" type="checkbox"
               :value="a.id" v-model="selectedAthletes">
        <label class="flex-grow py-3 cursor-pointer" :for="a.id">
          {{ a.lastName }} {{ a.firstName }}
        </label>
      </li>
    </ul>

    <template #bottom>
      <hr>
      <div class="grid grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="state" @click="updateAttendance()">
          {{ $t('glob.btn.create') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import Modal from "../modals/Modal.vue";
import LoadingBtn from "../button/LoadingBtn.vue";
import LoadingState from "../../types/LoadingState";
import User from "../../types/User";

export default defineComponent({
  name: "AttendanceModal",
  components: {LoadingBtn, Modal},
  props: {
    users: {type: Array as PropType<User[]>, required: true},
  },
  data() {
    return {
      selectedCoaches: [] as string[],
      selectedAthletes: [] as string[],
      state: {state: NaN} as LoadingState,
      instance: {} as Nds.ActivityInstance
    }
  },
  computed: {
    coaches(): User[] {
      // return this.users.filter(u => u.)
    },
    athletes(): User[] {
      return this.users
    },
  },
  methods: {
    setVisibility(visibility: boolean, instance?: Nds.ActivityInstance) {
      (this.$refs.modal as any).setVisibility(visibility)
      if(instance) this.instance = instance
      this.selectedCoaches = [] as string[]
      this.selectedAthletes = [] as string[]
    },
    updateAttendance() {
      this.setVisibility(false)
      this.$emit("updated")
    }
  }
})
</script>

<style scoped>

</style>