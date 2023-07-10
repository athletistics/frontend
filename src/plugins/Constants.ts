const API_URL: string = import.meta.env.VITE_CORE_API_URL
const TOTP_API_URL: string = import.meta.env.VITE_TOTP_API_URL
const STRAVA_API_URL: string = import.meta.env.VITE_STRAVA_API_URL
const STRAVA_CLIENT_ID: string = import.meta.env.VITE_STRAVA_CLIENT_ID
const STRAVA_REDIRECT: string = import.meta.env.VITE_STRAVA_REDIRECT_BASE

const STRAVA_AUTHORIZE: string = "https://www.strava.com/oauth/authorize"
const STRAVA_REDIRECT_QUERY: string = "approval_prompt=force&scope=read,activity:read_all"

export const OPEN_ROUTES: string[] = [
  'index',
  'callback',
]

export const TOTPLESS_ROUTES: string[] = [
  'index',
  'callback',
  'elevate',
  'me',
  'events',
  'home',
  'references'
]

const TOTP_CODE_LENGTH: number = 6
const ROLE_COACH: string = "coach"
const ROLE_ATHLETE: string = "athlete"
const ROLE_HEAD_COACH: string = "head_coach"

export default {
  API_URL,
  TOTP_API_URL,
  STRAVA_API_URL,
  STRAVA_CLIENT_ID,
  STRAVA_REDIRECT,
  STRAVA_AUTHORIZE,
  STRAVA_REDIRECT_QUERY,
  OPEN_ROUTES,
  TOTPLESS_ROUTES,
  TOTP_CODE_LENGTH,
  ROLE_COACH,
  ROLE_HEAD_COACH,
  ROLE_ATHLETE,
}