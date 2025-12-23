import { GraphQLClient } from 'graphql-request';
import Base64 from 'crypto-js/enc-base64.js';
import hmacSHA256 from 'crypto-js/hmac-sha256.js';
import md5 from 'crypto-js/md5.js';
export class OptiGraphQLClient {
    constructor(config) {
        const endpoint = config.baseUrl + config.path;
        const middleware = config.auth.type === 'hmac'
            ? this.createHmacMiddleware(config.auth.appKey, config.auth.secret)
            : this.createSingleKeyMiddleware(config.auth.token);
        this.client = new GraphQLClient(endpoint, {
            headers: config.headers,
            requestMiddleware: middleware,
        });
    }
    async query(query, variables) {
        const queryString = typeof query === 'string' ? query : query.toString();
        return this.client.request(queryString, variables);
    }
    setHeaders(headers) {
        this.client.setHeaders(headers);
    }
    setHeader(key, value) {
        this.client.setHeader(key, value);
    }
    createHmacSignature(method, url, body, appKey, secret) {
        const secretBytes = Base64.parse(secret);
        const urlObj = new URL(url);
        const target = urlObj.pathname + urlObj.search;
        const timestamp = new Date().getTime();
        const nonce = Math.random().toString(36).substring(7);
        const body_b64 = md5(String(body || '')).toString(Base64);
        const message = appKey + method + target + timestamp + nonce + body_b64;
        const hmac = hmacSHA256(message, secretBytes);
        const signature = Base64.stringify(hmac);
        return { timestamp, nonce, signature };
    }
    createHmacMiddleware(appKey, secret) {
        return async (request) => {
            const { timestamp, nonce, signature } = this.createHmacSignature(request.method || 'POST', request.url, request.body, appKey, secret);
            const authHeader = `epi-hmac ${appKey}:${timestamp}:${nonce}:${signature}`;
            return {
                ...request,
                headers: {
                    ...request.headers,
                    'Authorization': authHeader
                }
            };
        };
    }
    createSingleKeyMiddleware(token) {
        return async (request) => {
            const authHeader = `epi-single ${token}`;
            return {
                ...request,
                headers: {
                    ...request.headers,
                    'Authorization': authHeader
                }
            };
        };
    }
}
export * from 'graphql-request';
