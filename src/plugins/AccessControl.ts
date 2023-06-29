import {useMyUserStore} from "../stores/user";

const coach = "coach"
const headCoach = "head_coach"
const athlete = "athlete"

function isCoach(): boolean {
  const userStore = useMyUserStore()
  return userStore.hasRole(coach)
}

function isHeadCoach(): boolean {
  const userStore = useMyUserStore()
  return userStore.hasRole(headCoach)
}

function isAthlete(): boolean {
  const userStore = useMyUserStore()
  return userStore.hasRole(athlete)
}

export function canManageTeam(): boolean {
  return isHeadCoach()
}

export function canManageDiscipline(): boolean {
  return isCoach()
}

export function canManageEvents(): boolean {
  return isCoach()
}

export function canManageResults(): boolean {
  return isCoach()
}

export function canManageUsers(): boolean {
  return isHeadCoach()
}