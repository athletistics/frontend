export default interface User {
    id: string,
    firstName: string,
    lastName: string,
    genderId: number,
    languageId: number,
    birthDate: Date | string,
    clubId: string,
    primaryMail: string,
    placeId: number,
    nationalityId: number
}