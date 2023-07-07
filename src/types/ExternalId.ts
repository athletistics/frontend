declare namespace ExternalId {
  interface Id {
    externalId: string,
    internalId: string,
    externalIdTypeId: Type
  }

  interface Type {
    id: number,
    i18nName: string
  }
}