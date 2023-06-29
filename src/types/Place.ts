import State from "./State";

export default interface Place {
  id: number
  postCode: number
  place: string
  stateId?: number
  state?: State
  countryId?: number
}