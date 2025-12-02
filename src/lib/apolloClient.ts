import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://139.59.120.168:9090/graphql',
  credentials: 'include', 
});


const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token'); 
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Convert http:// to ws:// for WebSocket
const getWsUrl = () => {
  const url = import.meta.env.VITE_GRAPHQL_URL || 'http://139.59.120.168:9090/graphql';
  return url.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
};

const wsLink = new GraphQLWsLink(
  createClient({
    url: getWsUrl(),
    connectionParams: () => ({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    }),
  })
);

const splitLinkWithAuth = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

export const client = new ApolloClient({
  link: splitLinkWithAuth,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});
