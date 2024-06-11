export default interface Paginated<A> {
  page_index: number,
  count: number,
  data: A[]
}