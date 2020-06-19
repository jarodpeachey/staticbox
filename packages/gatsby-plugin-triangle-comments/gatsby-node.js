/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});
const fetch = require('node-fetch');

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest, reporter },
  options
) => {
  const { createNode } = actions;
  const { apiKey, siteId } = options;

  if (!apiKey) {
    reporter.panicOnBuild('Please define a Staticbox API key');
  }

  if (!siteId) {
    reporter.panicOnBuild('Please define a Staticbox site id');
  }

  // const client = new NetlifyAPI(apiKey, opts);

  const nodeHelper = (input, name) => {
    // input.netlify_id = input.id;
    // input.id = createNodeId(`gatsby-source-netlify-${input.netlify_id}`);
    // console.log(input);

    const nodeMeta = {
      id: createNodeId(`staticbox-${input.data && input.data.id ? input.data.id : 'styles'}`),
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
    fetch(`https://api.staticbox.io/api/sites/${siteId}/comments`, {
      headers: {
        'Content-Type': 'application/json',
        key: `${apiKey}`,
      },
    }).then((res) => {
      console.log(res);
      // reporter.panicOnBuild('Comments: ', res);
      res.json().then((json) => {
        console.log(json);
        json.data.forEach((submission) => {
          nodeHelper(submission, 'Comments');
        });
      });
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  try {
    fetch(`https://api.staticbox.io/api/sites/${siteId}/styles`, {
      headers: {
        'Content-Type': 'application/json',
        key: `${apiKey}`,
      },
    }).then((res) => {
      console.log(res);
      // reporter.panicOnBuild('Comments: ', res);
      res.json().then((json) => {
        console.log(json);
        nodeHelper(json.data[0], 'Styles');
      });
    });
  } catch (e) {
    console.error(e);
  }
};
