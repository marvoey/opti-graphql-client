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
    };
}
export declare class OptiGraphQLClient {
    private client;
    constructor(config: OptiGraphQLClientConfig);
    query<T = any>(query: string, variables?: Record<string, any>): Promise<T>;
    setHeaders(headers: Record<string, string>): void;
    setHeader(key: string, value: string): void;
    private createHmacSignature;
    private createHmacMiddleware;
    private createSingleKeyMiddleware;
}
export * from 'graphql-request';
