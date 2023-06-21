<template>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import {OidcClient} from "oidc-client-ts";
import authConfig from "../plugins/AuthConfig.ts";
import Const from "../plugins/Constants.ts";
import {useAuthStore} from "../stores/auth.ts";
import {useMyUserStore} from "../stores/user.ts";

export default defineComponent({
  setup() {
    const userStore = useMyUserStore();
    const authStore = useAuthStore();

    return {userStore, authStore}
  },
  mounted() {
    let client = new OidcClient(authConfig)
    const router = this.$router

    client.processSigninResponse(window.location.href).then ((response) => {
      this.authStore.token = response.access_token

      this.authStore.updateFromServer(() => {
        if(this.userStore.hasRole(Const.ROLE_COACH) || this.userStore.hasRole(Const.ROLE_HEAD_COACH)){
          if(!this.authStore.has2Fa){
            router.push('/elevate')
            return
          }
        }
        router.push('/home')
      })

      this.userStore.updateFromServer()

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