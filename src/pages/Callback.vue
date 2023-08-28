<template>
  <div></div>
</template>

<script lang="ts">
import {OidcClient} from "oidc-client-ts";
import {defineComponent} from "vue";

import authConfig from "@/plugins/AuthConfig";
import Const from "@/plugins/Constants";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useOidcStateStore} from "@/stores/oidcState";
import {useMyUserStore} from "@/stores/user";

export default defineComponent({
  setup() {
    const userStore = useMyUserStore();
    const authStore = useAuthStore();
    const dataStore = useDataStore();
    const oidcStateStore = useOidcStateStore()

    return {userStore, authStore, dataStore, oidcStateStore}
  },
  mounted() {
    const client = new OidcClient(authConfig)
    const router = this.$router

    client.processSigninResponse(window.location.href).then((response) => {
      if (response.state !== this.oidcStateStore.state) void router.push('/?error=invalidState')
      this.oidcStateStore.$reset()

      this.authStore.token = response.access_token

      this.userStore.updateFromServer()
      this.dataStore.updateAll()

      void this.authStore.updateFromServer(() => {
        if (this.userStore.hasRole(Const.ROLE_COACH) || this.userStore.hasRole(Const.ROLE_HEAD_COACH)) {
          if (!this.authStore.has2Fa) {
            void router.push('/elevate')
            return
          }
        }
        void router.push('/home')
      })

      void router.push('/home')
    }).catch(function (err) {
      console.error(err)
      void router.push('/?message=error')
    })
  }
})
</script>

<style scoped>

</style>