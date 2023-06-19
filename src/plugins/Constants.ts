const API_URL: string = import.meta.env.VITE_CORE_API_URL
const TOTP_API_URL: string = import.meta.env.VITE_TOTP_API_URL

export const OPEN_ROUTES: string[] = [
    'index',
    'callback',
]

const TOTP_CODE_LENGTH: number = 6
const ROLE_COACH: string = "coach"
const ROLE_ATHLETE: string = "athlete"
const ROLE_HEAD_COACH: string = "head_coach"

export default {
    API_URL,
    TOTP_API_URL,
    OPEN_ROUTES,
    TOTP_CODE_LENGTH,
    ROLE_COACH,
    ROLE_HEAD_COACH,
    ROLE_ATHLETE,
}