import {useAuthStore} from "@/stores/auth";
import {useMyUserStore} from "@/stores/user";

const coach = "coach"
const headCoach = "head_coach"

function isCoach(): boolean {
  const userStore = useMyUserStore()
  return userStore.hasRole(coach)
}

function isHeadCoach(): boolean {
  const userStore = useMyUserStore()
  return userStore.hasRole(headCoach)
}

function is2FaOk(): boolean {
  const authStore = useAuthStore()
  return authStore.is2FaOk
}

export function canManageTeam(): boolean {
  return isHeadCoach() && is2FaOk()
}

export function canManageDiscipline(): boolean {
  return isCoach() && is2FaOk()
}

export function canManageEvents(): boolean {
  return isCoach() && is2FaOk()
}

export function canManageResults(): boolean {
  return isCoach() && is2FaOk()
}

export function canManageActivities(): boolean {
  return isHeadCoach() && is2FaOk()
}

export function canManageActivityInstances(): boolean {
  return isCoach() && is2FaOk()
}

export function canManageUsers(): boolean {
  return isHeadCoach() && is2FaOk()
}