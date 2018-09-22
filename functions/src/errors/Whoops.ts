
import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Response {
            whoops?: Whoops
        }
    }
}

class WhoopsOptions {
    shouldIncludeErrorStackTrace: boolean = false;
    constructor(shouldIncludeErrorStackTrace?: boolean) {
        this.shouldIncludeErrorStackTrace = shouldIncludeErrorStackTrace;
    }
}

class WhoopsError {

    public status: number;
    public message?: String;
    public data?: object;
    public isDeveloperError: boolean = false;

    constructor(status: number, message?: string, data?: object, headers?: Map<string, string>) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}

class Whoops {

    private static httpResponseCodes = new Map<number, string>([
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
        this.send(new WhoopsError(400, message, data));
    }

    public unauthorized(message?: string, scheme?: string, attributes?: string) {          // Or function (message, wwwAuthenticate[])
        this.send(new WhoopsError(401, message));
    }

    public paymentRequired(message: string, data?: object) {
        this.send(new WhoopsError(402, message, data));
    }

    public forbidden(message: string, data?: object) {
        this.send(new WhoopsError(403, message, data));
    }

    public notFound(message: string, data?: object) {
        this.send(new WhoopsError(404, message, data));
    }

    public methodNotAllowed(message: string, data?: object, allow?: any) {

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

        this.send(new WhoopsError(405, message, data, headers));
    }

    public notAcceptable(message: string, data?: object) {
        this.send(new WhoopsError(406, message, data));
    }

    public proxyAuthRequired(message: string, data?: object) {
        this.send(new WhoopsError(407, message, data));
    }

    public clientTimeout(message: string, data?: object) {
        this.send(new WhoopsError(408, message, data));
    }

    public conflict(message: string, data?: object) {
        this.send(new WhoopsError(409, message, data));
    }

    public resourceGone(message: string, data?: object) {
        this.send(new WhoopsError(410, message, data));
    }

    public lengthRequired(message: string, data?: object) {
        this.send(new WhoopsError(411, message, data));
    }

    public preconditionFailed(message: string, data?: object) {
        this.send(new WhoopsError(412, message, data));
    }

    public entityTooLarge(message: string, data?: object) {
        this.send(new WhoopsError(413, message, data));
    }

    public uriTooLong(message: string, data?: object) {
        this.send(new WhoopsError(414, message, data));
    }

    public unsupportedMediaType(message: string, data?: object) {
        this.send(new WhoopsError(415, message, data));
    }

    public rangeNotSatisfiable(message: string, data?: object) {
        this.send(new WhoopsError(416, message, data));
    }

    public expectationFailed(message: string, data?: object) {
        this.send(new WhoopsError(417, message, data));
    }

    public teapot(message: string, data?: object) {
        this.send(new WhoopsError(418, message, data));
    }

    public badData(message: string, data?: object) {
        this.send(new WhoopsError(422, message, data));
    }

    public locked(message: string, data?: object) {
        this.send(new WhoopsError(423, message, data));
    }

    public failedDependency(message: string, data?: object) {
        this.send(new WhoopsError(424, message, data));
    }

    public preconditionRequired(message: string, data?: object) {
        this.send(new WhoopsError(428, message, data));
    }

    public tooManyRequests(message: string, data?: object) {
        this.send(new WhoopsError(429, message, data));
    }

    public illegal(message: string, data?: object) {
        this.send(new WhoopsError(451, message, data));
    }

    // 5xx Server Errors

    public internal(message, data, statusCode: number = 500) {
        this.send(new WhoopsError(statusCode, message, data));
    }

    public notImplemented(message: string, data?: object) {
        this.send(new WhoopsError(501, message, data));
    }

    public badGateway(message: string, data?: object) {
        this.send(new WhoopsError(502, message, data));
    }

    public serverUnavailable(message: string, data?: object) {
        this.send(new WhoopsError(503, message, data));
    }

    public gatewayTimeout(message: string, data?: object) {
        this.send(new WhoopsError(504, message, data));
    }

    public badImplementation(message: string, data?: object) {
        let error = new WhoopsError(500, message, data);
        error.isDeveloperError = true;
        this.send(error);
    }

    // MARK: Send response

    private send(error: WhoopsError) {
        let payload: any = {
            statusCode: error.status,
            error: Whoops.httpResponseCodes.get(error.status) || "Unknown",
            errorMessage: error.message,
            data: error.data
        };
        if (error.isDeveloperError) {
            payload.isDeveloperError = true;
        }
        if (this.options.shouldIncludeErrorStackTrace) {
            payload.errorStackTrace = "Unsupported feature";
        }
        this.response.status(error.status).send(payload);
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