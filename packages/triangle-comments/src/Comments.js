/* eslint-disable import/prefer-default-export */
/* eslint-disable react/jsx-fragments */
import React, { useState, useEffect, createRef } from 'react';
import styled from 'styled-components';
import { useStaticQuery, graphql } from 'gatsby';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { formatDate } from './utils/formatDate';
import Comment from './Comment';

function encode(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

const QUERY = gql`
  {
    allStaticboxComments {
      edges {
        node {
          data {
            comment
            date
            draft
            id
            name
            path
            parentComment
          }
        }
      }
    }
  }
`;

export const Comments = () => {
  // const data = useStaticQuery(graphql`
  //   query {
  //     allNetlifySubmissions {
  //       edges {
  //         node {
  //           id
  //           data {
  //             comment
  //             email
  //             name
  //             path
  //             parentCommentid
  //           }
  //           created_at(formatString: "M/D/YYYY")
  //         }
  //       }
  //     }
  //   }
  // `);

  const { loading, error, data } = useQuery(QUERY);

  console.log(loading, error, data);

  const [state, setState] = React.useState({});
  const [stateComments, setStateComments] = React.useState(
    loading ? [] : data && data.length ? Object.values(data)[0].edges : []
  );

  useEffect(() => {
    if (data) {
      const comments = Object.values(data)[0].edges;
      if (stateComments.length === 0 && comments.length > 0) {
        console.log(Object.values(data)[0]);

        setStateComments(comments);
      }

      // console.log(data.allStaticboxComments);
    }
  }, [data]);

  // const { apiKey } = window.triangle;

  // const fetchNewComments = async () => {
  //   const newComments = await fetch(
  //     `https://api.netlify.com/api/v1/sites/b6b13974-f786-41c8-841f-38ba49c28710/submissions/?access_token=${apiKey}`
  //   );

  //   return newComments;
  // };

  useEffect(() => {
    // const newComments = fetchNewComments().then((res) => {
    //   res.json().then((json) => {
    //     console.log('Sucess getting new comments: ', json);
    //     const insideNewComments = [];
    //     Object.values(json).forEach((submission) => {
    //       if (
    //         submission.data.path === window.location.pathname &&
    //         submission.data.name !== 'placeholder' &&
    //         submission.data.comment !== 'placeholder'
    //       ) {
    //         insideNewComments.push(submission);
    //       }
    //     });
    //     if (stateComments !== insideNewComments) {
    //       setStateComments(insideNewComments);
    //     }
    //   });
    // });
    // if (state.path !== window.location.pathname) {
    //   setState({ path: window.location.pathname });
    // }
  }, []);

  console.log('State comments: ', stateComments);

  console.log(
    'First level comments: ',
    stateComments
      .filter((comment) => comment.node.data.parentComment === '')
      .sort((a, b) => (a.node ? a.node.date - b.node.date : a.date - b.date))
  );
  console.log(
    'Replies: ',
    stateComments
      .filter((comment) => comment.node.data.parentComment !== '')
      .sort((a, b) => (a.node ? a.node.date - b.node.date : a.date - b.date))
  );

  const handleReplyOpen = (e) => {
    const id = e.target.getAttribute('id');
    setState({ ...state, parentCommentid: id });
    const newElement = document.createElement('div');

    newElement.innerHTML = `        <form
          class=${GrayForm.__linaria.className}
          name='Comments Awaiting Approval'
          method='post'
          id='form'
          // action='/thanks/'
          data-netlify='true'
          onSubmit={handleSubmit}
        >
          <input
            type='hidden'
            name='form-name'
            value='Comments Awaiting Approval'
          />
          <div class='row mobile-lg'>
            <div class='col col-6'>
              <label class=${HiddenLabel.__linaria.className} for='path'>Path</label>
              <input
                class=${HiddenInput.__linaria.className}
                name='path'
                id='path'
                type='text'
                value=${state.path}
              />
              <label class=${HiddenLabel.__linaria.className} for='parentCommentid'>Parent Comment id</label>
              <input
                class=${HiddenInput.__linaria.className}
                name='parentCommentid'
                id='parentCommentid'
                type='text'
                value=${id}
              />
              <label class=${HiddenLabel.__linaria.className}  for='name'>Name</label>
              <input class=${Input.__linaria.className}
                onChange={handleChange}
                placeholder="Name"
                type='text'
                name='name'
                id='name'
              />
            </div>
            <div class='col col-6'>
              <label class=${HiddenLabel.__linaria.className}  for='email'>Email</label>
              <input class=${Input.__linaria.className}
                onChange={handleChange}
                type='email'
                name='email'
                id='email'
                placeholder="Email"
              />
            </div>
            <div class='col col-12'>
              <label class=${HiddenLabel.__linaria.className}  for='comment'>Comment</label>
              <textarea
                class=${TextArea.__linaria.className}
                onChange={handleChange}
                name='comment'
                id='comment'
                placeholder="Comment here..."
              ></textarea>
            </div>
            <div class='col col-12'>
              <button class='primary ${Button.__linaria.className}' type='submit'>
                Reply
              </button>
            </div>
          </div>
        </form>`;

    e.target.parentElement.appendChild(newElement);
  };

  return (
    <>
      {stateComments
        .filter((comment) => comment.node.data.parentComment === '')
        .sort((a, b) => (a.node ? a.node.id - b.node.id : a.id - b.id)).length >
        0 && (
        <>
          <h2 className='title center-text'>Comments</h2>
          <CommentsSection>
            {stateComments
              .filter((comment) => comment.node.data.parentComment === '')
              .sort((a, b) => (a.node ? a.node.id - b.node.id : a.id - b.id))
              .map((comment) => {
                return (
                  <Comment
                    comment={comment}
                    replies={stateComments
                      .filter(
                        (replyComment) =>
                          replyComment.node.data.parentComment ===
                          comment.node.data.id
                      )
                      .sort((a, b) =>
                        a.node ? a.node.id - b.node.id : a.id - b.id
                      )}
                  />
                );
              })}
          </CommentsSection>
        </>
      )}
    </>
  );
};

const GrayForm = styled.form`
  background: #f7f7f7;
  padding: 16px;
  margin-top: 12px;
`;

const Label = styled.label`
  margin-bottom: 8px;
  display: block;
  font-weight: 500;
`;

const Error = styled.small`
  display: block;
  margin-top: 8px;
  color: tomato;
`;

const Input = styled.input`
  padding: 14px;
  border: 2px solid white;
  box-shadow: 1px 1px 3px 0px #e7e7e7;
  font-size: 16px;
  outline: none;
  width: 100%;
  :focus {
    border: 2px solid #264966;
  }
`;

const GrayTextArea = styled.textarea`
  padding: 14px;
  background: #f7f7f7;
  border: 2px solid #f7f7f7;
  font-size: 16px;
  outline: none;
  width: 100%;
  resize: vertical;
  min-height: 100px;
  vertical-align: top;
  :focus {
    border: 2px solid #264966;
  }
`;

const GrayInput = styled.input`
  padding: 14px;
  background: #f7f7f7;
  border: 2px solid #f7f7f7;
  font-size: 16px;
  margin-bottom: 4px;
  outline: none;
  width: 100%;
  :focus {
    border: 2px solid #264966;
  }
`;

const HiddenLabel = styled.label`
  height: 0px !important;
  width: 0px !important;
  background: transparent !important;
  color: transparent !important;
  border: none !important;
  outline: none !important;
  cursor: default !important;
  padding: 0 !important;
  margin: 0 !important;
  max-height: 0px !important;
  min-height: 0px !important;
  display: float;
`;

const HiddenInput = styled.input`
  height: 0px !important;
  width: 0px !important;
  background: transparent !important;
  color: transparent !important;
  border: none !important;
  outline: none !important;
  cursor: default !important;
  padding: 0 !important;
  margin: 0 !important;
  max-height: 0px !important;
  min-height: 0px !important;
  display: float;
`;

const TextArea = styled.textarea`
  padding: 14px;
  width: 100%;
  min-height: 125px;
  border: 2px solid white;
  box-shadow: 1px 1px 3px 0px #e7e7e7;
  font-size: 16px;
  outline: none;
  resize: vertical;
  :focus {
    border: 2px solid #264966;
  }
`;

const Button = styled.button`
  margin: 0 !important;
  margin-left: auto !important;
  display: block;
`;

const CommentsSection = styled.div``;

const GrayComment = styled.div`
  padding: 14px;
  // box-shadow: 1px 1px 3px 0px #e7e7e7;
  font-size: 16px;
  background: #f7f7f7;
  outline: none;
  width: 100%;
  margin: 12px 0;
  :last-child {
    margin-bottom: 0;
  }
`;

const CommentFooter = styled.div`
  font-size: 14px;
  color: #666;
`;
