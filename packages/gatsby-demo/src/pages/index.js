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
    <Form />
    <Comments />
  </Layout>
);

export default IndexPage;
