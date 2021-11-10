import NodeCache from 'node-cache';

import {
  sql,
  createPool,
  TaggedTemplateLiteralInvocationType,
  DatabasePoolType,
} from 'slonik';

import {
  InterceptorType,
  PrimitiveValueExpressionType,
  QueryResultRowType,
  QueryResultType,
  QueryType,
  TypeParserType,
} from 'slonik/dist/src/types';

import { createFieldNameTransformationInterceptor } from 'slonik-interceptor-field-name-transformation';
import { createQueryNormalisationInterceptor } from 'slonik-interceptor-query-normalisation';
import { createQueryCacheInterceptor } from 'slonik-interceptor-query-cache';

export { sql };

const cache = new NodeCache({
  checkperiod: 60,
  stdTTL: 60,
  useClones: false,
});

const hashQuery = (query: QueryType): string => {
  return JSON.stringify(query);
};

const _interceptors: readonly InterceptorType[] = [
  createFieldNameTransformationInterceptor({
    format: 'CAMEL_CASE',
  }),
  createQueryNormalisationInterceptor({
    stripComments: true,
  }),
  createQueryCacheInterceptor({
    storage: {
      get: (query: QueryType) => {
        return cache.get(hashQuery(query)) || null;
      },
      set: (
        query: QueryType,
        cacheAttributes: CacheAttributesType,
        queryResult: QueryResultType<QueryResultRowType>
      ) => {
        cache.set(hashQuery(query), queryResult, cacheAttributes.ttl);
      },
    },
  }),
];

const numericTypeParser = {
  name: 'numeric',
  parse: (value: string) => {
    return parseFloat(value);
  },
};

const dateTypeParser = {
  name: 'timestamp',
  parse: (value: string) => {
    return (value === null ? value : value.replace(' ', 'T'))
  },
};

// const dateParser = (value: string) => {
//   return value;
// };

const _typeParsers: readonly TypeParserType[] = [
  dateTypeParser,
  numericTypeParser,
];

type CacheAttributesType = {
  ttl: number;
};

const db: DatabasePoolType = createPool(
  process.env.DATABASE_URL || '',
  {
    //preferNativeBindings: true,
    // connectionRetryLimit: 6,
    connectionTimeout: 'DISABLE_TIMEOUT',
    idleInTransactionSessionTimeout: 'DISABLE_TIMEOUT',
    idleTimeout: 'DISABLE_TIMEOUT',
    // maximumPoolSize: 10,

    typeParsers: _typeParsers,
    interceptors: _interceptors,
  }
);

export function nestQuerySingle(
  query: TaggedTemplateLiteralInvocationType<
    Record<string, PrimitiveValueExpressionType>
  >
) {
  return sql`
    (SELECT row_to_json(x) FROM (${query}) x)
  `;
}

export function nestQuery(
  query: TaggedTemplateLiteralInvocationType<
    Record<string, PrimitiveValueExpressionType>
  >

) {
  return sql`
    coalesce(
      (
        SELECT array_to_json(array_agg(row_to_json(x)))
        FROM (${query}) x
      ),
      '[]'
    )
  `;
}

export default db;
