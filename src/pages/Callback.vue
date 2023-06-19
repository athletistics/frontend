<template>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import {OidcClient} from "oidc-client-ts";
import authConfig from "../plugins/AuthConfig.ts";
import store from "../store";
import axios from "axios";
import Const from "../plugins/Constants.ts";

export default defineComponent({
  mounted() {
    let client = new OidcClient(authConfig)
    const router = this.$router
    client.processSigninResponse(window.location.href).then(function (response) {
      store.commit("setToken", response.access_token)

      axios.request({
        url: "/me/auth",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + response.access_token
        }
      }).then(response => {
        store.commit("setUserData", response.data)

        if(store.state.roles.indexOf(Const.ROLE_COACH) !== -1 || store.state.roles.indexOf(Const.ROLE_HEAD_COACH) !== -1){
          console.log("helo")
          if(!store.state.has2Fa){
          console.log("heloo")
            router.push('/elevate')
            return
          }
        }
        router.push('/home')
      })

      router.push('/home')
    }).catch(function (err) {
      console.error(err)
      router.push('/?message=error')
    })
  }
})
</script>

<style scoped>

</style>