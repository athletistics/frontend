export namespace ExternalId {
  export interface Id {
    externalId: string,
    internalId: string,
    externalIdTypeId: number
  }

  export interface Type {
    id: number,
    i18nName: string
  }
}