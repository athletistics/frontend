<template>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import {OidcClient} from "oidc-client-ts";

import {useAuthStore} from "@/stores/auth";
import {useMyUserStore} from "@/stores/user";
import {useDataStore} from "@/stores/data";
import {useOidcStateStore} from "@/stores/oidcState";

import Const from "@/plugins/Constants";
import authConfig from "@/plugins/AuthConfig";

export default defineComponent({
  setup() {
    const userStore = useMyUserStore();
    const authStore = useAuthStore();
    const dataStore = useDataStore();
    const oidcStateStore = useOidcStateStore()

    return {userStore, authStore, dataStore, oidcStateStore}
  },
  mounted() {
    let client = new OidcClient(authConfig)
    const router = this.$router

    client.processSigninResponse(window.location.href).then ((response) => {
      if (response.state !== this.oidcStateStore.state) router.push('/?error=invalidState')
      this.oidcStateStore.$reset()

      this.authStore.token = response.access_token

      this.userStore.updateFromServer()
      this.dataStore.updateAll()

      this.authStore.updateFromServer(() => {
        if(this.userStore.hasRole(Const.ROLE_COACH) || this.userStore.hasRole(Const.ROLE_HEAD_COACH)){
          if(!this.authStore.has2Fa){
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