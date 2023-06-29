<template>
  <h1>{{ $t('page.home.title') }}</h1>

  <SimpleTable :headers="['glob.user.firstName', 'glob.user.lastName', 'glob.user.primaryPhone']" :state="state"
               :i18n="true">
    <SimpleTableRow v-for="a in athletes">
      <SimpleTableCell>{{a.firstName}}</SimpleTableCell>
      <SimpleTableCell>{{a.lastName}}</SimpleTableCell>
      <SimpleTableCell><a :href="toPhoneLink(a.primaryPhone)">{{a.primaryPhone}}</a></SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>

</template>

<script lang="ts">

import {defineComponent} from "vue";
import SimpleTable from "../components/list/SimpleTable.vue";
import {LoadingStates} from "../types/LoadingStates";
import axios from "axios";
import Const from "../plugins/Constants";
import {useAuthStore} from "../stores/auth";
import User from "../types/User";
import {useToastStore} from "../stores/toast";
import SimpleTableRow from "../components/list/SimpleTableRow.vue";
import SimpleTableCell from "../components/list/SimpleTableCell.vue";
import {useMyUserStore} from "../stores/user";

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
  methods: {
    toPhoneLink(number: string) : string {
      return "tel:" + number.replace(/\s/g, "");
    }
  },
  computed: {
    emergencyVisible() : boolean {
      return this.userStore.hasRole("coach")
    }
  },
  mounted() {
    // load emergency data
    this.state = LoadingStates.Loading
    axios.request({
      url: "/users/emergency",
      method: 'get',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.authStore.token
      }
    }).then(response => {
      this.athletes = response.data
      this.state = response.data ? LoadingStates.Loaded : LoadingStates.Empty
    }).catch(error => {
      this.toastStore.addToastFromAxiosError(error)
      this.state = LoadingStates.Error
    })
  }
})
</script>

<style scoped>

</style>