declare namespace ServerMessage {
  interface Error {
    error: number
    subCode: number
    message: string
    hiddenMessage: string
  }
}