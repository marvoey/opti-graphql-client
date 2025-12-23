# opti-graphql-client

A TypeScript GraphQL client for Opti projects with built-in HMAC and single-key authentication support.

## Installation

```bash
npm install opti-graphql-client
```

or

```bash
yarn add opti-graphql-client
```

## Features

- Built on top of `graphql-request`
- TypeScript support with full type definitions
- HMAC authentication with signature generation
- Single-key authentication
- Support for typed GraphQL documents
- Flexible header management

## Usage

### HMAC Authentication

```typescript
import { OptiGraphQLClient } from 'opti-graphql-client';

const client = new OptiGraphQLClient({
  baseUrl: 'https://api.example.com',
  path: '/graphql',
  auth: {
    type: 'hmac',
    appKey: 'your-app-key',
    secret: 'your-secret-key'
  }
});

// Execute a query
const result = await client.query(`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`, { id: '123' });
```

### Single-Key Authentication

```typescript
import { OptiGraphQLClient } from 'opti-graphql-client';

const client = new OptiGraphQLClient({
  baseUrl: 'https://api.example.com',
  path: '/graphql',
  auth: {
    type: 'single-key',
    token: 'your-auth-token'
  }
});

const result = await client.query(`
  query {
    currentUser {
      id
      name
    }
  }
`);
```

### With Custom Headers

```typescript
const client = new OptiGraphQLClient({
  baseUrl: 'https://api.example.com',
  path: '/graphql',
  headers: {
    'X-Custom-Header': 'value'
  },
  auth: {
    type: 'single-key',
    token: 'your-auth-token'
  }
});

// Update headers after initialization
client.setHeader('X-Another-Header', 'another-value');
client.setHeaders({
  'X-Header-1': 'value1',
  'X-Header-2': 'value2'
});
```

### With Typed Documents

```typescript
import { OptiGraphQLClient, TypedDocument } from 'opti-graphql-client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface GetUserVariables {
  id: string;
}

const getUserQuery: TypedDocument<User, GetUserVariables> = {
  toString: () => `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
      }
    }
  `
};

const result = await client.query<User, GetUserVariables>(
  getUserQuery,
  { id: '123' }
);
```

## API

### `OptiGraphQLClient`

#### Constructor

```typescript
new OptiGraphQLClient(config: OptiGraphQLClientConfig)
```

**Config Options:**

- `baseUrl` (string): The base URL of the GraphQL API
- `path` (string): The path to the GraphQL endpoint
- `headers` (optional): Additional headers to include in requests
- `auth`: Authentication configuration
  - HMAC: `{ type: 'hmac', appKey: string, secret: string }`
  - Single-key: `{ type: 'single-key', token: string }`

#### Methods

- `query<TResult, TVariables>(query, variables?)`: Execute a GraphQL query
- `setHeader(key, value)`: Set a single header
- `setHeaders(headers)`: Set multiple headers

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
