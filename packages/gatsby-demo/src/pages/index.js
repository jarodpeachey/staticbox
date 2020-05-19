import React from 'react';
import { Link } from 'gatsby';

import Layout from '../components/layout';
import Image from '../components/image';
import SEO from '../components/seo';
import { Form } from '../../../triangle-comments/src/Form';
import { Comments } from '../../../triangle-comments/src/Comments';

const IndexPage = () => (
  <Layout>
    <SEO title='Home' />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <Form />
    <Comments />
  </Layout>
);

export default IndexPage;
