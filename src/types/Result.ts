declare module Result {
  interface RequestBody {
    id?: number,
    value: number,
    rank?: number
    wind?: number,
    disciplineId: string,
    userId: string,
    eventId: string,
    categoryId?: number
  }

  interface Data {
    userFirstName: string,
    userLastName: string,
    categoryName: string,
    disciplineName: string,
    disciplineId: string,
    eventName: string,
    eventPlace: string,
    eventOutdoor: boolean,
    date: Date,
    value: string, // value is stored as decimal, API sends a string
    wind?: string, // wind is stored as decimal, API sends a string
    rank?: string
  }
}