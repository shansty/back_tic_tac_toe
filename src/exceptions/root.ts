export class Exeption extends Error {
    message: string;
    errorCode: ErrorCode;
    statusCode: number;
    errors: any;

    constructor(message:string, errorCode:ErrorCode, statusCode:number, errors:any) {
        super(message)
        this.message = message
        this.errorCode = errorCode
        this.statusCode = statusCode
        this.errors = errors
    }
}

export enum ErrorCode {
    GAME_NOT_FOUND = 1001,
    USER_NOT_FOUND = 1002,
}