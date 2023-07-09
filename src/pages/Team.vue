<template>
  <h1>{{ team.name }}&nbsp;</h1>


  <div class="grid md:grid-cols-3 grid-cols-2 gap-4" v-if="canManageTeam() && !editMode">
    <LoadingBtn full outlined visual-type="primary" @click="setModalVisibility(true, false)">{{
        $t('page.team.addPart')
      }}
    </LoadingBtn>
    <LoadingBtn full outlined visual-type="primary" @click="setModalVisibility(true, true)">{{
        $t('page.team.addCoach')
      }}
    </LoadingBtn>
    <LoadingBtn class="md:col-span-1 col-span-2" full outlined visual-type="error" @click="setSelectable(true)">
      {{ $t('page.team.selectForRemoval') }}
    </LoadingBtn>
  </div>

  <div class="grid md:grid-cols-2 gap-4" v-if="canManageTeam() && editMode">
    <LoadingBtn full outlined visual-type="error" :loading="removeState" @click="removeFromTeam()">{{
        $t('page.team.removePart')
      }}
    </LoadingBtn>
    <LoadingBtn full outlined @click="setSelectable(false)">
      {{ $t('glob.btn.cancel') }}
    </LoadingBtn>
  </div>


  <h2>{{$t('page.team.title.coaches')}}</h2>
  <SimpleList :state="state">
    <SimpleListEntry v-for="p in participantCoaches" :to="'/athletes/' + p.id" :enabled="!editMode">
      <input v-if="editMode" class="mr-2" :id="p.id" :value="p.id" type="checkbox" v-model="usersToRemove">
      <label class="w-full" :for="p.id">{{ p.lastName }} {{ p.firstName }}</label>
    </SimpleListEntry>
  </SimpleList>

  <h2>{{$t('page.team.title.athletes')}}</h2>
  <SimpleList :state="state">
    <SimpleListEntry v-for="p in participantAthletes" :to="'/athletes/' + p.id" :enabled="!editMode">
      <input v-if="editMode" class="mr-2" :id="p.id" :value="p.id" type="checkbox" v-model="usersToRemove">
      <label class="w-full" :for="p.id">{{ p.lastName }} {{ p.firstName }}</label>
    </SimpleListEntry>
  </SimpleList>

  <div class="py-5"></div>

  <TitleWithBtnPlus :btn-visible="canManageActivities()" @btn-click="setActivityModalVisibility(true)">
    {{ $t('page.team.activities') }}
  </TitleWithBtnPlus>

  <SimpleTable i18n :state="stateActivities"
               :headers="['page.activity.weekday', 'page.activity.startTime', 'page.activity.duration', 'page.activity.startDate', 'page.activity.endDate', 'page.activity.place']">
    <SimpleTableRow v-for="a in activities" clickable @click="$router.push('/activity/' + a.id)">
      <SimpleTableCell>{{ $t('glob.weekday[' + a.weekday + ']') }}</SimpleTableCell>
      <SimpleTableCell>{{ a.startTime }}</SimpleTableCell>
      <SimpleTableCell>{{ a.duration }}</SimpleTableCell>
      <SimpleTableCell>{{ $d(a.startDate) }}</SimpleTableCell>
      <SimpleTableCell>{{ $d(a.endDate) }}</SimpleTableCell>
      <SimpleTableCell>{{ a.place }}</SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>

  <Modal ref="modal">
    <form class="space-y-4 with-label">
      <h3>{{ asCoach ? $t('page.team.addCoachTitle') : $t('page.team.addPartTitle') }}</h3>
      <hr>
      <div v-for="u in filteredUsers" class="flex hover:bg-main cursor-pointer">
        <input class="mr-2 cursor-pointer" :id="u.id" :value="u.id" type="checkbox" v-model="usersToAdd">
        <label class="flex-grow py-3 cursor-pointer" :for="u.id">{{ u.lastName }} {{ u.firstName }}</label>
      </div>
      <hr>
      <div class="grid sm:grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="addState" @click="addToTeam()">{{
            $t('glob.btn.add')
          }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setModalVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </div>
    </form>
  </Modal>

  <ActivityModal ref="activity"/>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import Team from "../types/Team";
import axios from "axios";
import Const from "../plugins/Constants"
import User from "../types/User";
import {useAuthStore} from "../stores/auth";
import Modal from "../components/modals/Modal.vue";
import {useToastStore} from "../stores/toast";
import SimpleList from "../components/list/SimpleList.vue";
import SimpleListEntry from "../components/list/SimpleListEntry.vue";
import {LoadingStates} from "../types/LoadingStates";
import {canManageActivities, canManageTeam} from "../plugins/AccessControl";
import LoadingBtn from "../components/button/LoadingBtn.vue";
import LoadingState from "../types/LoadingState";
import TitleWithBtnPlus from "../components/title/TitleWithBtnPlus.vue";
import SimpleTable from "../components/list/SimpleTable.vue";
import SimpleTableRow from "../components/list/SimpleTableRow.vue";
import SimpleTableCell from "../components/list/SimpleTableCell.vue";
import ActivityModal from "../components/nds/ActivityModal.vue";
import {Nds} from "../types/Nds";

export default defineComponent({
  components: {
    ActivityModal,
    SimpleTableCell,
    SimpleTableRow, SimpleTable, TitleWithBtnPlus, LoadingBtn, SimpleListEntry, Modal, SimpleList
  },
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()

    return {authStore, toastStore}
  },
  data() {
    return {
      asCoach: false as boolean,
      team: {} as Team,
      users: [] as User[],
      participantCoaches: [] as User[],
      participantAthletes: [] as User[],
      state: NaN as LoadingStates,
      stateActivities: NaN as LoadingStates,
      editMode: false as boolean,
      activities: [] as Nds.Activity[],
      usersToAdd: [] as string[],
      usersToRemove: [] as string[],
      addState: {state: NaN} as LoadingState,
      removeState: {state: NaN} as LoadingState
    }
  },
  computed: {
    filteredUsers(): User[] {
      const users = []
      for (let i = 0; i < this.users.length; i++) {
        if (this.participantAthletes.some(p => p.id === this.users[i].id)) continue
        if (this.participantCoaches.some(p => p.id === this.users[i].id)) continue
        users.push(this.users[i])
      }
      return users
    }
  },
  methods: {
    canManageActivities,
    canManageTeam,
    setModalVisibility(visible: boolean, asCoach?: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
      this.asCoach = !!asCoach
    },
    setActivityModalVisibility(visible: boolean) {
      (this.$refs.activity as any).setVisibility(visible)
    },
    setSelectable(selectable: boolean) {
      this.editMode = selectable
      this.usersToRemove = []
    },
    addToTeam() {
      this.addState.state = LoadingStates.Loading
      axios.request({
        url: "/teams/" + this.$route.params.id + "/participants",
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.usersToAdd.map(id => {
          return {userId: id, isCoach: this.asCoach}
        })
      }).then(() => {
        this.addState.state = LoadingStates.Loaded
        this.setModalVisibility(false)
        this.getParticipants()
        this.usersToAdd = []
        this.toastStore.addToast({title: "Success", color: "bg-primary"})
      }).catch(error => {
        this.addState.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(error)
      })
    },
    removeFromTeam() {
      this.removeState.state = LoadingStates.Loading
      axios.request({
        url: "/teams/" + this.$route.params.id + "/participants",
        method: 'delete',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.usersToRemove.map(id => {
          return {userId: id}
        })
      }).then(() => {
        this.removeState.state = LoadingStates.Loaded
        this.editMode = false
        this.getParticipants()
        this.usersToRemove = []
      }).catch(error => {
        this.removeState.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(error)
      })
    },
    getAthletes() {
      axios.request({
        url: "/users",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.users = response.data
      })
    },
    getParticipants() {
      this.participantAthletes = [] as User[]
      this.participantCoaches = [] as User[]
      this.state = LoadingStates.Loading

      axios.request({
        url: "/teams/" + this.$route.params.id + "/participants",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.state = response.data.athletes.length ? LoadingStates.Loaded : LoadingStates.Empty
        this.participantAthletes = response.data.athletes
        this.participantCoaches = response.data.coaches
      }).catch(() => {
        this.state = LoadingStates.Error
      })
    },
    getActivities() {
      this.stateActivities = LoadingStates.Loading
      axios.request({
        url: "/nds/activities?teamId=" + this.$route.params.id,
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.activities = response.data
        this.stateActivities = response.data?.length ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch(e => {
        this.stateActivities = LoadingStates.Error
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

    this.getAthletes()
    this.getActivities()
    this.getParticipants()
  }
})
</script>

<style scoped>

</style>