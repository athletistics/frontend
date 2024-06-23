declare namespace Result {
  interface RequestBody {
    id?: number,
    value: number,
    rank?: string
    wind?: number,
    disciplineId: string,
    userId?: string,
    eventId: string,
    categoryId?: number
    date: string,
    dateObj?: Date,
    isPersonalTrainingResult: boolean,
  }

  interface Data {
    id?: number,
    userId: string,
    userFirstName: string,
    userLastName: string,
    categoryName: string,
    disciplineName: string,
    disciplineId: string,
    eventId: string,
    eventName: string,
    eventPlace: string,
    eventOutdoor: boolean,
    isTraining: boolean,
    date: Date,
    value: string, // value is stored as decimal, API sends a string
    wind?: string, // wind is stored as decimal, API sends a string
    rank?: string,
    isPersonalTrainingResult: boolean
  }

  interface Import {
    id: number
    name: string,
    distance: number,
    moving_time: number,
    start_date_local: Date,
    discipline_id?: string,
  }

  interface Static {
    id: number,
    value: string,
    categoryId: string,
    disciplineId: string,
    resultStaticTypeId: number
  }

  interface StaticType {
    id: number,
    i18nType: string
  }
}