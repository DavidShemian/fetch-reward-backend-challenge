import { ISuccessfulResponse } from '../interfaces/successful-response.interface';

export default abstract class BaseController {
    protected responseSuccess<T>(message: string, data?: T): ISuccessfulResponse<T> {
        return { message, data };
    }
}
