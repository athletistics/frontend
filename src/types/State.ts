import Country from "./Country";

export default interface State {
  id: number
  name: string
  short: string
  country: Country
}