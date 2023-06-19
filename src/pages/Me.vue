<template>
  <h1>My Account</h1>

  <p>{{data}}</p>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";
import Const from "../plugins/Constants.ts";
import {mapGetters} from "vuex";

export default defineComponent({
  name: "Me",
  data() {
    return {
      data: {}
    }
  },
  computed: {
    ...mapGetters({
      token: 'getToken'
    })
  },
  mounted() {
    if (!this.token) {
      this.$router.push('/')
    }

    axios.request({
      url: "/me",
      method: 'get',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.token
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