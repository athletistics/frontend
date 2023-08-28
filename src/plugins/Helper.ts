import moment, {duration} from "moment/moment";
import {LocationQueryValue} from "vue-router";

import Discipline from "@/types/Discipline";

export function formatResult(value: string, discipline: Discipline | undefined): string {
  if (!discipline) return value
  const numValue = Number.parseFloat(value)

  const d = moment.utc(duration(value, 'seconds').as('millisecond'))

  switch (true) {
    case discipline.isDescending:
      return numValue.toFixed(2) + 'm'
    case numValue < 60:
      return d.format("s.SS") + 's'
    case numValue < 60 * 60:
      return d.format("m:ss.SS") + 's'
    default:
      return d.format("h:mm:ss.SS") + 's'
  }
}

export function routeParamToString(param: string | string[]): string {
  return typeof param === 'string' ? param : param.join('')
}

export function routeQueryToString(query: string | LocationQueryValue[] | null): string {
  if(!query) return ""
  if(typeof query === 'string') return query
  return query.join('')
}