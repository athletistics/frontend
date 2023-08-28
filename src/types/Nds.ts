import Team from "./Team";

export namespace Nds {
  export interface Activity {
    id: string,
    startDate: Date,
    endDate: Date,
    startTime: Date,
    duration: number,
    weekday: number,
    place: string,
    team: Team,
  }

  export interface ActivityReq {
    startDate: Date,
    endDate: Date,
    startTime: Date,
    duration: number,
    weekday: number,
    place: string,
    teamId: string,
  }

  export interface ActivityType {
    id: number,
    i18nName: string,
  }

  export interface ActivityInstance {
    id: string,
    date: Date,
    startTime?: Date,
    duration?: number,
    place?: string,
    ndsActivityType: ActivityType,
  }

  export interface ActivityInstanceReq {
    date: Date | string,
    startTime?: Date | string,
    duration?: number,
    place?: string,
    ndsActivityId: string,
    ndsActivityTypeId: number,
  }

  export interface Attendance {
    userId: string,
    ndsActivityInstanceId: string,
    isCoach: boolean,
  }

  export interface AttendanceReq {
    userId: string,
    isCoach: boolean,
  }
}