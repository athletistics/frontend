<template>
  <h1>{{ team.name }}</h1>

  <hr>

  <p v-for="p in participants">{{ p.lastName }} {{ p.firstName }}</p>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Team from "../types/Team.ts";
import axios from "axios";
import Const from "../plugins/Constants.ts"
import User from "../types/User.ts";
import {useAuthStore} from "../stores/auth.ts";

export default defineComponent({
  setup() {
    const authStore = useAuthStore()

    return {authStore}
  },
  data() {
    return {
      team: {} as Team,
      participants: [] as User[]
    }
  },
  methods: {
    getParticipants() {
      axios.request({
        url: "/teams/" + this.$route.params.id + "/participants",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.participants = response.data
      })
    }
  },
  mounted() {
    axios.request({
      url: "/teams/" + this.$route.params.id,
      method: 'get',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.authStore.token
      }
    }).then(response => {
      this.team = response.data
    })

    this.getParticipants()
  }
})
</script>

<style scoped>

</style>