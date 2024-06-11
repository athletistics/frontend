import Team from "@/types/Team";

import Club from "./Club";
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
  birthDateObj: Date,
  address: string,
  houseNumber: string,
  postCode: string,
  city: string,
  countryId: number,
  country?: Country,
  nationalityId: number,
  nationality?: Country,
  teams?: Team[],
  withLogin: boolean,
  userState?: string,
}

export const USER_STATE_INITIAL = "USER_STATE_INITIAL"
export const USER_STATE_ACTIVE = "USER_STATE_ACTIVE"