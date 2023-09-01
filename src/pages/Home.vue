<template>
  <div v-if="emergencyVisible">
    <h1>{{ $t('page.home.title') }}</h1>

    <SimpleTable
        :headers="['glob.user.firstName', 'glob.user.lastName', 'glob.user.primaryPhone']" :state="state"
        :i18n="true">
      <SimpleTableRow v-for="a in athletes">
        <SimpleTableCell>{{ a.firstName }}</SimpleTableCell>
        <SimpleTableCell>{{ a.lastName }}</SimpleTableCell>
        <SimpleTableCell><a :href="toPhoneLink(a.primaryPhone)">{{ a.primaryPhone }}</a></SimpleTableCell>
      </SimpleTableRow>
    </SimpleTable>
  </div>
  <h1 v-else>Hello {{userStore.user.firstName}}!</h1>

</template>

<script lang="ts">

import axios, {AxiosError, AxiosResponse} from "axios";
import {defineComponent} from "vue";

import SimpleTable from "@/components/list/SimpleTable.vue";
import SimpleTableCell from "@/components/list/SimpleTableCell.vue";
import SimpleTableRow from "@/components/list/SimpleTableRow.vue";
import Const from "@/plugins/Constants";
import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";
import {useMyUserStore} from "@/stores/user";
import {LoadingStates} from "@/types/LoadingStates";
import User from "@/types/User";

export default defineComponent({
  components: {SimpleTableCell, SimpleTableRow, SimpleTable},
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const userStore = useMyUserStore()
    return {authStore, toastStore, userStore}
  },
  data() {
    return {
      athletes: [] as User[],
      state: NaN as LoadingStates
    }
  },
  computed: {
    emergencyVisible(): boolean {
      return this.userStore.hasRole("coach")
    }
  },
  mounted() {
    if (!this.emergencyVisible) return

    // load emergency data
    this.state = LoadingStates.Loading
    axios.request({
      url: "/users/emergency",
      method: 'get',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.authStore.token
      }
    }).then((response: AxiosResponse<User[], any>) => {
      this.athletes = response.data
      this.state = response.data ? LoadingStates.Loaded : LoadingStates.Empty
      console.log('loaded')
    }).catch((error: AxiosError) => {
      this.toastStore.addToastFromAxiosError(error)
      this.state = LoadingStates.Error
    })
  },
  methods: {
    toPhoneLink(number: string): string {
      return "tel:" + number.replace(/\s/g, "");
    }
  }
})
</script>

<style scoped>

</style>