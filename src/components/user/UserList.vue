<template>
  <SimpleTable :headers="['glob.user.name', 'glob.user.birthdate']" :i18n="true" :state="state">
    <SimpleTableRow v-for="u in users" :clickable="true" @click="toUser(u.id)">
      <SimpleTableCell class="table-cell">{{ u.lastName }} {{ u.firstName }}</SimpleTableCell>
      <SimpleTableCell class="table-cell">{{ $d(birthDateAsDate(u.birthDate)) }}</SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'

import SimpleTable from "@/coreComponents/list/SimpleTable.vue";
import SimpleTableCell from "@/coreComponents/list/SimpleTableCell.vue";
import SimpleTableRow from "@/coreComponents/list/SimpleTableRow.vue";
import {LoadingStates} from "@/types/LoadingStates";
import User from "@/types/User";

export default defineComponent({
  name: "UserList",
  components: {SimpleTableCell, SimpleTableRow, SimpleTable},
  props: {
    users: {type: Array as PropType<User[]>, required: true},
    state: {type: Number as PropType<LoadingStates>, required: true},
  },
  methods: {
    birthDateAsDate(d: Date | string) {
      if (d instanceof Date) {
        return d
      }
      return new Date(d)
    },
    toUser(id: string) {
      void this.$router.push("/athletes/" + id)
    }
  }
})
</script>


<style scoped>

</style>