/**
 * Generic typed document that can be converted to a string
 */
export interface TypedDocument<TResult = any, TVariables = any> {
    toString(): string;
}
export interface OptiGraphQLClientConfig {
    baseUrl: string;
    path: string;
    headers?: Record<string, string>;
    auth: {
        type: 'hmac';
        appKey: string;
        secret: string;
    } | {
        type: 'single-key';
        token: string;
    } | {
        type: 'basic';
        username: string;
        password: string;
    };
}
export declare class OptiGraphQLClient {
    private client;
    constructor(config: OptiGraphQLClientConfig);
    query<TResult = any, TVariables extends Record<string, any> = Record<string, any>>(query: TypedDocument<TResult, TVariables> | string, variables?: TVariables): Promise<TResult>;
    setHeaders(headers: Record<string, string>): void;
    setHeader(key: string, value: string): void;
    private createHmacSignature;
    private createHmacMiddleware;
    private createSingleKeyMiddleware;
    private createBasicAuthMiddleware;
}
export * from 'graphql-request';
