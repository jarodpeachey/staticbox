/* eslint-disable import/prefer-default-export */
/* eslint-disable react/jsx-fragments */
import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { formatDate } from './utils/formatDate';
import { useStaticQuery, graphql } from 'gatsby';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Reply from './Reply';

function encode(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

const QUERY = gql`
  {
    allStaticboxStyles {
      edges {
        node {
          data {
            button {
              customCSS
            }
            color {
              primary
              secondary
              text
            }
            input {
              customCSS
              fontSize
              paddingX
              paddingY
            }
            label {
              customCSS
              fontSize
            }
          }
        }
      }
    }
  }
`;

const Comment = ({ comment, children, replies }) => {
  const { faunaClient, q } = window.triangle;
  const [formOpen, setFormOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [name, setName] = useState('');
  const [reply, setReply] = useState('');

  const { loading, error, data } = useQuery(QUERY);

  console.log(loading, error, data);

  const [colors, setColors] = useState({
    primary: '#fbbe76',
    secondary: '#aacd67',
  });

  const [labelStyles, setLabelStyles] = useState({
    fontSize: 16,
    customCSS: 'margin: 0;',
  });

  const [inputStyles, setInputStyles] = useState({
    fontSize: 16,
    customCSS: 'margin: 0;',
    paddingX: 16,
    paddingY: 16,
  });

  const [buttonStyles, setButtonStyles] = useState({
    customCSS: 'margin: 0;',
  });

  useEffect(() => {
    if (data) {
      console.log('Styles: ', data.allStaticboxStyles);

      setColors({
        ...data.allStaticboxStyles.edges[0].node.data.color,
      });
      setLabelStyles({
        ...data.allStaticboxStyles.edges[0].node.data.label,
      });
      setInputStyles({
        ...data.allStaticboxStyles.edges[0].node.data.input,
      });
      setButtonStyles({
        ...data.allStaticboxStyles.edges[0].node.data.button,
      });
    }
  }, [data]);

  console.log(replies);

  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleReplyChange = (e) => {
    setReply(e.target.value);
  };

  const handleReplyOpen = (e) => {
    setFormOpen(!formOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Triangle: ', window.triangle);

    faunaClient
      .query(
        q.Let(
          {
            site: q.Get(q.Match(q.Index('site_by_id'), window.triangle.siteId)),
            userRef: q.Select(['data', 'user'], q.Var('site')),
            siteRef: q.Ref(
              q.Collection('sites'),
              q.Select(['ref', 'id'], q.Var('site'))
            ),
          },
          {
            comment: q.Call(
              q.Function('create_comment'),
              `comment-${new Date().getTime()}`,
              name,
              reply,
              new Date().getTime(),
              path,
              false,
              q.Var('userRef'),
              q.Var('siteRef'),
              comment.node.data.id
            ),
            siteRef: q.Var('siteRef'),
            userRef: q.Var('userRef'),
          }
        )
      )
      .then((response) => console.log(response))
      .catch((error) => console.log(error));
  };

  return (
    <>
      <Wrapper>
        <CommentTitle>{comment.node.data.name}</CommentTitle>
        <CommentDate>{formatDate(comment.node.data.date)}</CommentDate>
        <CommentBody>{comment.node.data.comment}</CommentBody>
        <CommentFooter>
          <FooterLink color={colors.primary} onClick={() => setShowReplies(!showReplies)}>
            {showReplies ? 'Collapse' : `(+${replies.length}) Expand`}
          </FooterLink>
          <FooterLink color={colors.primary} onClick={handleReplyOpen}>
            {formOpen ? 'Cancel' : 'Reply'}
          </FooterLink>
        </CommentFooter>
        {formOpen && (
          <form
            method='post'
            id='form'
            onSubmit={handleSubmit}
            style={{ marginTop: 12, padding: 16, background: '#dfdfdf' }}
          >
            <div className='custom-row'>
              <div className='custom-col custom-col-12'>
                <Input
                  customCSS={inputStyles.customCSS}
                  fontSize={inputStyles.fontSize}
                  color={colors.primary}
                  padding={{
                    vertical: inputStyles.paddingY,
                    horizontal: inputStyles.paddingX,
                  }}
                  onChange={handleNameChange}
                  type='text'
                  name='name'
                  id='name'
                  placeholder='Name'
                  value={name}
                />
              </div>
              <div className='custom-col custom-col-12'>
                <TextArea
                  customCSS={inputStyles.customCSS}
                  fontSize={inputStyles.fontSize}
                  color={colors.primary}
                  padding={{
                    vertical: inputStyles.paddingY,
                    horizontal: inputStyles.paddingX,
                  }}
                  onChange={handleReplyChange}
                  name='comment'
                  id='comment'
                  placeholder='Comment'
                  value={reply}
                ></TextArea>
              </div>
              <div className='custom-col custom-col-12'>
                <Button
                  customCSS={buttonStyles.customCSS}
                  background={colors.primary}
                  name='button'
                >
                  Reply
                </Button>
              </div>
            </div>
          </form>
        )}
      </Wrapper>
      {replies && replies.length > 0 && (
        <>
          {showReplies && (
            <RepliesWrapper color={`${colors.primary}30`}>
              {replies.map((replyComment) => {
                return (
                  <Reply
                    colors={colors}
                    buttonStyles={buttonStyles}
                    inputStyles={inputStyles}
                    comment={replyComment}
                  />
                );
              })}
            </RepliesWrapper>
          )}
        </>
      )}
    </>
  );
};

export default Comment;

const Wrapper = styled.div`
  padding: 14px;
  border: 1px solid #dfdfdf;
  border-radius: 3px;
  font-size: 16px;
  background: white;
  outline: none;
  width: 100%;
  margin: 12px 0;
  background: ${(props) => (props.gray ? '#dfdfdf' : 'white')};
`;

const CommentTitle = styled.h3`
  margin: 0;
`;

const CommentDate = styled.small`
  display: block;
  margin-bottom: 12px;
`;

const CommentBody = styled.p``;

const CommentFooter = styled.div`
  font-size: 16px;
  display: flex;
  justify-content: space-between;
`;

const FooterLink = styled.span`
  :hover {
    color: ${(props) => props.color};
    cursor: pointer;
  }
`;

const Label = styled.label`
  margin-bottom: 8px;
  display: block;
  font-size: ${(props) => props.fontSize}px !important;
  ${(props) =>
    props.customCSS &&
    css`
      ${props.customCSS}
    `}
`;

const Input = styled.input`
  padding-top: ${(props) => props.padding.vertical}px;
  padding-right: ${(props) => props.padding.horizontal}px;
  padding-left: ${(props) => props.padding.horizontal}px;
  padding-bottom: ${(props) => props.padding.vertical}px;
  margin: 0;
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 5px;
  :focus {
    outline: 1px ${(props) => props.color} auto;
  }
  font-size: ${(props) => props.fontSize}px !important;
  ${(props) =>
    props.customCSS &&
    css`
      ${props.customCSS}
    `}
`;

const TextArea = styled.textarea`
  padding-top: ${(props) => props.padding.vertical}px;
  padding-right: ${(props) => props.padding.horizontal}px;
  padding-left: ${(props) => props.padding.horizontal}px;
  padding-bottom: ${(props) => props.padding.vertical}px;
  width: 100%;
  font-size: ${(props) => props.fontSize}px !important;
  margin: 0;
  border: 1px solid #e8e8e8;
  border-radius: 5px;
  min-height: 150px;
  resize: vertical;
  :focus {
    outline: 1px ${(props) => props.color} auto;
  }
  ${(props) =>
    props.customCSS &&
    css`
      ${props.customCSS}
    `}
`;

const Button = styled.button`
  padding: 12px;
  background: ${(props) => props.background};
  color: white;
  border: none;
  outline: none;
  cursor: pointer;
  border-radius: 5px;
  margin-left: auto;
  ${(props) =>
    props.customCSS &&
    css`
      ${props.customCSS}
    `}
`;

const RepliesWrapper = styled.div`
  border-left: 2px solid ${(props) => props.color};
  margin-left: 32px;
  padding-left: 32px;
  width: calc(100% - 64px);
`;
