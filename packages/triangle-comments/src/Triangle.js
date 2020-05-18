import { useStaticQuery } from 'gatsby';
import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import faunadb, { query as q } from 'faunadb';
import { client } from './apollo/client';

export const TriangleContext = React.createContext({});

/**
 * Manages the shopping cart, which is persisted in local storage.
 * The cart and related methods are shared through context.
 */

export class TriangleConstructor {
  color = 'tomato';

  apiKey = '';

  faunaClient = null;

  q = null;

  constructor(props) {
    console.log(props);

    this.apiKey = props.apiKey;
    this.color = props.color;
    this.faunaClient = props.faunaClient;
    this.q = props.q;
  }
}

export const Triangle = ({ options, children }) => {
  const { apiKey, color } = options;

  const faunaClient = new faunadb.Client({
    secret: apiKey,
  });

  console.log(faunaClient);

  window.triangle = new TriangleConstructor({apiKey, color, faunaClient, q});

  const ctx = {
    apiKey,
    color,
    faunaClient,
    q,
  };

  return (
    <ApolloProvider client={client}>
      <TriangleContext.Provider value={{ ...ctx }}>
        {children}
      </TriangleContext.Provider>
    </ApolloProvider>
  );
};
