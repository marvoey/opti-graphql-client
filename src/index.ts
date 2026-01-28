import { GraphQLClient } from 'graphql-request';
import Base64 from 'crypto-js/enc-base64.js';
import hmacSHA256 from 'crypto-js/hmac-sha256.js';
import md5 from 'crypto-js/md5.js';
import Utf8 from 'crypto-js/enc-utf8.js';

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

export class OptiGraphQLClient {
  private client: GraphQLClient;

  constructor(config: OptiGraphQLClientConfig) {
    const endpoint = config.baseUrl + config.path;

    let middleware;
    if (config.auth.type === 'hmac') {
      middleware = this.createHmacMiddleware(config.auth.appKey, config.auth.secret);
    } else if (config.auth.type === 'single-key') {
      middleware = this.createSingleKeyMiddleware(config.auth.token);
    } else {
      middleware = this.createBasicAuthMiddleware(config.auth.username, config.auth.password);
    }

    this.client = new GraphQLClient(endpoint, {
      headers: config.headers,
      requestMiddleware: middleware,
    });
  }

  async query<TResult = any, TVariables extends Record<string, any> = Record<string, any>>(
    query: TypedDocument<TResult, TVariables> | string,
    variables?: TVariables
  ): Promise<TResult> {
    const queryString = typeof query === 'string' ? query : query.toString();
    return this.client.request<TResult>(queryString, variables);
  }

  setHeaders(headers: Record<string, string>): void {
    this.client.setHeaders(headers);
  }

  setHeader(key: string, value: string): void {
    this.client.setHeader(key, value);
  }

  private createHmacSignature(
    method: string,
    url: string,
    body: string | undefined,
    appKey: string,
    secret: string
  ): { timestamp: number; nonce: string; signature: string } {
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

  private createHmacMiddleware(appKey: string, secret: string) {
    return async (request: any) => {
      const { timestamp, nonce, signature } = this.createHmacSignature(
        request.method || 'POST',
        request.url,
        request.body,
        appKey,
        secret
      );

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

  private createSingleKeyMiddleware(token: string) {
    return async (request: any) => {
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

  private createBasicAuthMiddleware(username: string, password: string) {
    return async (request: any) => {
      const credentials = Utf8.parse(`${username}:${password}`);
      const base64Credentials = Base64.stringify(credentials);
      const authHeader = `Basic ${base64Credentials}`;

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
