export class HttpError extends Error {
  public status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status

    Object.setPrototypeOf(this, HttpError.prototype)
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(`Network Error: ${message}`)
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}
