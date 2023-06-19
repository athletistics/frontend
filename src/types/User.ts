export default interface User {
    id: number,
    username: string,
    first_name: string,
    last_name: string,
    sex: string,
    birth_date: string,
    user_type: number,
    id_team: number | null,
    team_name: string
    email: string | null,

    generate_password?: boolean
}