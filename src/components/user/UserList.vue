<template>
  <div class="overflow-x-scroll">
    <table class="min-w-full">
      <thead class="border-b">
      <tr>
        <th scope="col" class="table-head">{{ $t('glob.user.name') }}</th>
        <th scope="col" class="table-head">{{ $t('glob.user.birthdate') }}</th>
      </tr>
      </thead>
      <tbody :state="state">
      <tr v-for="u in users" class="table-row cursor-pointer" v-on:click="toUser(u.id)">
        <td class="table-cell">{{ u.lastName }} {{ u.firstName }}</td>
        <td class="table-cell">{{ $d(u.birthDate) }}</td>
      </tr>
      </tbody>

      <ListStates :state="state"/>
    </table>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import User from "../../types/User.ts";
import {LoadingStates} from "../../types/LoadingStates.ts";
import ListStates from "../list/ListStates.vue";

export default defineComponent({
  name: "UserList",
  components: {ListStates},
  props: {
    users: {type: Array as PropType<User[]>, required: true},
    state: {type: Object as PropType<LoadingStates>, required: true},
  },
  methods: {
    toUser(id: string) {
      this.$router.push("/athletes/" + id)
    }
  }
})
</script>


<style scoped>

</style>