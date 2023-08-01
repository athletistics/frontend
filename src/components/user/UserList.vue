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

import User from "@/types/User";
import {LoadingStates} from "@/types/LoadingStates";
import ListStates from "@/components/list/TableStates.vue";
import SimpleTable from "@/components/list/SimpleTable.vue";
import SimpleTableRow from "@/components/list/SimpleTableRow.vue";
import SimpleTableCell from "@/components/list/SimpleTableCell.vue";

export default defineComponent({
  name: "UserList",
  components: {SimpleTableCell, SimpleTableRow, SimpleTable, ListStates},
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
      this.$router.push("/athletes/" + id)
    }
  }
})
</script>


<style scoped>

</style>