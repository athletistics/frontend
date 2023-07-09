declare namespace ExternalId {
  interface Id {
    externalId: string,
    internalId: string,
    externalIdTypeId: number
  }

  interface Type {
    id: number,
    i18nName: string
  }
}