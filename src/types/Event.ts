export default interface Event {
    id: string,
    eventTypeId: number,
    name: string,
    place: string
    date: string,
    clubId: string,
    isHomologated: boolean
    isOutdoor: boolean
}