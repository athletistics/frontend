import Club from "./Club";
import Place from "./Place";
import Country from "./Country";

export default interface User {
  id: string,
  firstName: string,
  lastName: string,
  primaryMail: string,
  primaryPhone: string,
  languageId: number,
  genderId: number,
  clubId: string,
  club?: Club,
  oasi?: string,
  birthDate: Date | string,
  address: string,
  placeId: number,
  place?: Place
  nationalityId: number
  nationality?: Country
}