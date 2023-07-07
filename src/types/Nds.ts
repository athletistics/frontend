declare namespace Nds {
  interface Activity {
    id: string,
    startDate: Date,
    endDate: Date,
    startTime: Date,
    duration: number,
    weekday: number,
    place: string,
    team: typeof import('./Team'),
  }

  interface ActivityReq {
    startDate: Date,
    endDate: Date,
    startTime: Date,
    duration: number,
    weekday: number,
    place: string,
    teamId: string,
  }

  interface ActivityType {
    id: number,
    i18nName: string,
  }

  interface ActivityInstance {
    id: string,
    date: Date,
    startTime?: Date,
    duration?: number,
    place?: string,
    ndsActivityType: ActivityType,
  }

  interface ActivityInstanceReq {
    date: Date,
    startTime?: Date,
    duration?: number,
    place?: string,
    ndsActivityId: string,
    ndsActivityTypeId: number,
  }

  interface Attendance {
    userId: string,
    ndsActivityInstanceId: string,
    isCoach: boolean,
  }

  interface AttendanceReq {
    userId: string,
    isCoach: boolean,
  }
}