/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});
const faunadb = require('faunadb');
const q = faunadb.query;

// import faunadb, { query as q } from 'faunadb';

// const fetch = require('node-fetch');

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest, reporter },
  options
) => {
  const { createNode } = actions;

  createNode({
    name: 'Jarod',
    id: 'sdyfy98',
    internal: {
      type: 'Test',
    },
  });

  const { color, apiKey } = options;

  const faunaClient = new faunadb.Client({
    secret: apiKey,
  });

  if (!apiKey) {
    reporter.panicOnBuild('Please define a Staticbox API key');
  }

  // const client = new NetlifyAPI(apiKey, opts);

  const nodeHelper = (input, name) => {
    // input.netlify_id = input.id;
    // input.id = createNodeId(`gatsby-source-netlify-${input.netlify_id}`);
    // console.log(input);
    createNode({
      name: 'Test',
      id: 'sdfksdf',
      children: [],
      internal: {
        type: 'Test',
      },
      parent: null,
    });

    const nodeMeta = {
      id: input.data.id,
      parent: null,
      children: [],
      internal: {
        type: `Staticbox${name}`,
      },
    };
    nodeMeta.internal.content = JSON.stringify(nodeMeta);
    nodeMeta.internal.contentDigest = createContentDigest(nodeMeta);

    console.log(input, nodeMeta);

    createNode({ ...input, ...nodeMeta });
  };

  try {
    faunaClient
      .query(
        q.Map(
          q.Paginate(q.Match(q.Index('all_comments')), { size: 10000 }),
          q.Lambda(
            'commentsRef',
            q.Let(
              {
                comments: q.Get(q.Var('commentsRef')),
              },
              {
                ref: q.Select(['ref'], q.Var('comments')),
                data: q.Select(['data'], q.Var('comments')),
              }
            )
          )
        )
      )
      .then((res) => {
        console.log(res.data);
        res.data.forEach((submission) => {
          nodeHelper(submission, 'Comments');
        });
      });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
