export class ResponseDto {
  public readonly error: number;
  public readonly statusCode: number;
  public readonly message: string;

  constructor(error: number, statusCode: number, message: string) {
    this.error = error;
    this.statusCode = statusCode;
    this.message = message;
  }
}

export class SuccessResponseDto<T> extends ResponseDto {
  public readonly data?: T;

  constructor(error: number, statusCode: number, message: string, data?: T) {
    super(error, statusCode, message);
    this.data = data;
  }
}

export default class FailedResponseDto extends ResponseDto {
  public errorMessage: string;

  public constructor(
    error: number,
    statusCode: number,
    message: string,
    errorMessage: string,
  ) {
    super(error, statusCode, message);
    this.errorMessage = errorMessage;
  }
}
