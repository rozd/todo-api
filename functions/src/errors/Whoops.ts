import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Response {
            whoops?: Whoops
        }
    }
}

class WhoopsError extends Error {

    public static whoopsify(error: Error): WhoopsError {
        if (error instanceof WhoopsError) {
            return error;
        }

        let whoopsError: WhoopsError = new WhoopsError(500, 'An internal server error occurred', error);
        whoopsError.stack = error.stack;

        return whoopsError;
    }

    public status: number;
    public data?: object;
    public isDeveloperError: boolean = false;

    constructor(status: number, message: string, data?: object, headers?: Map<string, string>) {
        super(message);
        this.status = status;
        this.data = data;
    }

    toPayload(options: WhoopsOptions): object {
        let payload: any = {
            statusCode: this.status,
            error: Whoops.httpResponseCodes.get(this.status) || "Unknown",
            errorMessage: this.message,
            data: this.data
        };
        if (this.isDeveloperError) {
            payload.isDeveloperError = true;
        }
        if (options.shouldIncludeErrorStack) {
            payload.errorStack = this.stack;
        }
        return payload;
    }

}

class WhoopsOptions {
    shouldIncludeErrorStack: boolean = false;
    constructor(shouldIncludeErrorStackTrace?: boolean) {
        this.shouldIncludeErrorStack = shouldIncludeErrorStackTrace;
    }
}

export class Whoops {

    // 4xx Client Errors

    public static badRequest(message: string, data?: object): WhoopsError {
        return new WhoopsError(400, message, data);
    }

    public static unauthorized(message?: string, scheme?: string, attributes?: string): WhoopsError {          // Or function (message, wwwAuthenticate[])
        return new WhoopsError(401, message);
    }

    public static paymentRequired(message: string, data?: object): WhoopsError {
        return new WhoopsError(402, message, data);
    }

    public static forbidden(message: string, data?: object): WhoopsError {
        return new WhoopsError(403, message, data);
    }

    public static notFound(message: string, data?: object): WhoopsError {
        return new WhoopsError(404, message, data);
    }

    public static methodNotAllowed(message: string, data?: object, allow?: any): WhoopsError {

        let allowHeaderValue: string = undefined;
        if (allow) {
            if (Array.isArray(allow)) {
                allowHeaderValue = allow.join(', ');
            } else {
                allowHeaderValue = allow;
            }
        }

        let headers: Map<string, string> = undefined;
        if (allowHeaderValue) {
            headers = new Map([['Allow', allowHeaderValue]]);
        }

        return new WhoopsError(405, message, data, headers);
    }

    public static notAcceptable(message: string, data?: object): WhoopsError {
        return new WhoopsError(406, message, data);
    }

    public static proxyAuthRequired(message: string, data?: object): WhoopsError {
        return new WhoopsError(407, message, data);
    }

    public static clientTimeout(message: string, data?: object): WhoopsError {
        return new WhoopsError(408, message, data);
    }

    public static conflict(message: string, data?: object): WhoopsError {
        return new WhoopsError(409, message, data);
    }

    public static resourceGone(message: string, data?: object): WhoopsError {
        return new WhoopsError(410, message, data);
    }

    public static lengthRequired(message: string, data?: object): WhoopsError {
        return new WhoopsError(411, message, data);
    }

    public static preconditionFailed(message: string, data?: object): WhoopsError {
        return new WhoopsError(412, message, data);
    }

    public static entityTooLarge(message: string, data?: object): WhoopsError {
        return new WhoopsError(413, message, data);
    }

    public static uriTooLong(message: string, data?: object): WhoopsError {
        return new WhoopsError(414, message, data);
    }

    public static unsupportedMediaType(message: string, data?: object): WhoopsError {
        return new WhoopsError(415, message, data);
    }

    public static rangeNotSatisfiable(message: string, data?: object): WhoopsError {
        return new WhoopsError(416, message, data);
    }

    public static expectationFailed(message: string, data?: object): WhoopsError {
        return new WhoopsError(417, message, data);
    }

    public static teapot(message: string, data?: object): WhoopsError {
        return new WhoopsError(418, message, data);
    }

    public static badData(message: string, data?: object): WhoopsError {
        return new WhoopsError(422, message, data);
    }

    public static locked(message: string, data?: object): WhoopsError {
        return new WhoopsError(423, message, data);
    }

    public static failedDependency(message: string, data?: object): WhoopsError {
        return new WhoopsError(424, message, data);
    }

    public static preconditionRequired(message: string, data?: object): WhoopsError {
        return new WhoopsError(428, message, data);
    }

    public static tooManyRequests(message: string, data?: object): WhoopsError {
        return new WhoopsError(429, message, data);
    }

    public static illegal(message: string, data?: object): WhoopsError {
        return new WhoopsError(451, message, data);
    }

    // 5xx Server Errors

    public static internal(message, data, statusCode: number = 500): WhoopsError {
        return new WhoopsError(statusCode, message, data);
    }

    public static notImplemented(message: string, data?: object): WhoopsError {
        return new WhoopsError(501, message, data);
    }

    public static badGateway(message: string, data?: object): WhoopsError {
        return new WhoopsError(502, message, data);
    }

    public static serverUnavailable(message: string, data?: object): WhoopsError {
        return new WhoopsError(503, message, data);
    }

    public static gatewayTimeout(message: string, data?: object): WhoopsError {
        return new WhoopsError(504, message, data);
    }

    public static badImplementation(message: string, data?: object): WhoopsError {
        let error = new WhoopsError(500, message, data);
        error.isDeveloperError = true;
        return error;
    }

    static httpResponseCodes = new Map<number, string>([
        [100, 'Continue'],
        [101, 'Switching Protocols'],
        [102, 'Processing'],
        [200, 'OK'],
        [201, 'Created'],
        [202, 'Accepted'],
        [203, 'Non-Authoritative Information'],
        [204, 'No Content'],
        [205, 'Reset Content'],
        [206, 'Partial Content'],
        [207, 'Multi-Status'],
        [300, 'Multiple Choices'],
        [301, 'Moved Permanently'],
        [302, 'Moved Temporarily'],
        [303, 'See Other'],
        [304, 'Not Modified'],
        [305, 'Use Proxy'],
        [307, 'Temporary Redirect'],
        [400, 'Bad Request'],
        [401, 'Unauthorized'],
        [402, 'Payment Required'],
        [403, 'Forbidden'],
        [404, 'Not Found'],
        [405, 'Method Not Allowed'],
        [406, 'Not Acceptable'],
        [407, 'Proxy Authentication Required'],
        [408, 'Request Time-out'],
        [409, 'Conflict'],
        [410, 'Gone'],
        [411, 'Length Required'],
        [412, 'Precondition Failed'],
        [413, 'Request Entity Too Large'],
        [414, 'Request-URI Too Large'],
        [415, 'Unsupported Media Type'],
        [416, 'Requested Range Not Satisfiable'],
        [417, 'Expectation Failed'],
        [418, 'I\'m a teapot'],
        [422, 'Unprocessable Entity'],
        [423, 'Locked'],
        [424, 'Failed Dependency'],
        [425, 'Unordered Collection'],
        [426, 'Upgrade Required'],
        [428, 'Precondition Required'],
        [429, 'Too Many Requests'],
        [431, 'Request Header Fields Too Large'],
        [451, 'Unavailable For Legal Reasons'],
        [500, 'Internal Server Error'],
        [501, 'Not Implemented'],
        [502, 'Bad Gateway'],
        [503, 'Service Unavailable'],
        [504, 'Gateway Time-out'],
        [505, 'HTTP Version Not Supported'],
        [506, 'Variant Also Negotiates'],
        [507, 'Insufficient Storage'],
        [509, 'Bandwidth Limit Exceeded'],
        [510, 'Not Extended'],
        [511, 'Network Authentication Required']
    ]);

    protected response: Response;
    protected options: WhoopsOptions;

    constructor(response: Response, options?: WhoopsOptions) {
        this.response = response;
        this.options  = options || new WhoopsOptions();
    }

    // MARK: - Errors

    // 4xx Client Errors

    public badRequest(message: string, data?: object) {
        this.send(Whoops.badRequest(message, data));
    }

    public unauthorized(message?: string, scheme?: string, attributes?: string) {          // Or function (message, wwwAuthenticate[])
        this.send(Whoops.unauthorized(message, scheme, attributes));
    }

    public paymentRequired(message: string, data?: object) {
        this.send(Whoops.paymentRequired(message, data));
    }

    public forbidden(message: string, data?: object) {
        this.send(Whoops.forbidden(message, data));
    }

    public notFound(message: string, data?: object) {
        this.send(Whoops.notFound(message, data));
    }

    public methodNotAllowed(message: string, data?: object, allow?: any) {
        this.send(Whoops.methodNotAllowed(message, data, allow));
    }

    public notAcceptable(message: string, data?: object) {
        this.send(Whoops.notAcceptable(message, data));
    }

    public proxyAuthRequired(message: string, data?: object) {
        this.send(Whoops.proxyAuthRequired(message, data));
    }

    public clientTimeout(message: string, data?: object) {
        this.send(Whoops.clientTimeout(message, data));
    }

    public conflict(message: string, data?: object) {
        this.send(Whoops.conflict(message, data));
    }

    public resourceGone(message: string, data?: object) {
        this.send(Whoops.resourceGone(message, data));
    }

    public lengthRequired(message: string, data?: object) {
        this.send(Whoops.lengthRequired(message, data));
    }

    public preconditionFailed(message: string, data?: object) {
        this.send(Whoops.preconditionFailed(message, data));
    }

    public entityTooLarge(message: string, data?: object) {
        this.send(Whoops.entityTooLarge(message, data));
    }

    public uriTooLong(message: string, data?: object) {
        this.send(Whoops.uriTooLong(message, data));
    }

    public unsupportedMediaType(message: string, data?: object) {
        this.send(Whoops.unsupportedMediaType(message, data));
    }

    public rangeNotSatisfiable(message: string, data?: object) {
        this.send(Whoops.rangeNotSatisfiable(message, data));
    }

    public expectationFailed(message: string, data?: object) {
        this.send(Whoops.expectationFailed(message, data));
    }

    public teapot(message: string, data?: object) {
        this.send(Whoops.teapot(message, data));
    }

    public badData(message: string, data?: object) {
        this.send(Whoops.badData(message, data));
    }

    public locked(message: string, data?: object) {
        this.send(Whoops.locked(message, data);
    }

    public failedDependency(message: string, data?: object) {
        this.send(Whoops.failedDependency(message, data));
    }

    public preconditionRequired(message: string, data?: object) {
        this.send(Whoops.preconditionRequired(message, data));
    }

    public tooManyRequests(message: string, data?: object) {
        this.send(Whoops.tooManyRequests(message, data));
    }

    public illegal(message: string, data?: object) {
        this.send(Whoops.illegal(message, data));
    }

    // 5xx Server Errors

    public internal(message, data, statusCode = 500) {
        this.send(Whoops.internal(message, data, statusCode));
    }

    public notImplemented(message: string, data?: object) {
        this.send(Whoops.notImplemented(message, data));
    }

    public badGateway(message: string, data?: object) {
        this.send(Whoops.badGateway(message, data));
    }

    public serverUnavailable(message: string, data?: object) {
        this.send(Whoops.serverUnavailable(message, data));
    }

    public gatewayTimeout(message: string, data?: object) {
        this.send(Whoops.gatewayTimeout(message, data));
    }

    public badImplementation(message: string, data?: object) {
        this.send(Whoops.badImplementation(message, data));
    }

    // MARK: Send response

    public send(error: Error) {
        const whoopsError = WhoopsError.whoopsify(error);
        this.response.status(whoopsError.status).send(whoopsError.toPayload(this.options));
    }
}

export default function (options?: WhoopsOptions) {
    return function middleware(req: Request, res: Response, next: NextFunction) {
        if (res.whoops) {
            throw new Error('Whoops already exists on the response object.');
        }
        res.whoops = new Whoops(res, options);
        next();
    }
}