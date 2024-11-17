import { ErrorCode, Exeption } from "./root";

export class NotFoundException extends Exeption {
    constructor(message:string, errorCode:ErrorCode) {
        super(message, errorCode, 404, null)
    }
}