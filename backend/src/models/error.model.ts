export class ErrorWithStatus extends Error {
  public statusCode: number | undefined
  public get status(): number | undefined{
    return this.statusCode
  }
  constructor(statusCode: number | undefined, message: string | undefined) {
    super(message);
    this.statusCode = statusCode;
  }
}
