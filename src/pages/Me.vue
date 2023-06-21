<template>
  <h1>My Account</h1>

  <p>{{data}}</p>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";
import Const from "../plugins/Constants.ts";
import {useAuthStore} from "../stores/auth.ts";

export default defineComponent({
  name: "Me",
  setup() {
    const authStore = useAuthStore()

    return {authStore}
  },
  data() {
    return {
      data: {}
    }
  },
  mounted() {
    if (!this.authStore.token) {
      this.$router.push('/')
    }

    axios.request({
      url: "/me",
      method: 'get',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.authStore.token
      }
    }).then(response => {
      this.data = response.data
    }).catch(response => {
      console.log(response)
    })
  }
})
</script>

<style scoped>

</style>