/* eslint-disable import/prefer-default-export */
import React, { useState, useContext, useEffect } from 'react';
import styled, { css } from 'styled-components';
import './css/style.css';
import { useStaticQuery, graphql } from 'gatsby';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

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

export const Form = () => {
  const { faunaClient, q, color } = window.triangle;
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [notification, setNotification] = useState('success');

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

  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

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

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
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
              comment,
              new Date().getTime(),
              path,
              false,
              q.Var('userRef'),
              q.Var('siteRef'),
              ''
            ),
            siteRef: q.Var('siteRef'),
            userRef: q.Var('userRef'),
          }
        )
      )
      .then((response) => {
        setName('');
        setComment('');
        console.log(response);
        setNotification('success');
        setTimeout(() => {
          setNotification(false);
        }, 750);
      })
      .catch((error) => {
        setName('');
        setComment('');
        console.log(error);
        setNotification('success');
        setTimeout(() => {
          setNotification(false);
        }, 750);
      });
  };

  return (
    <div className='wrapper'>
      <h2>Add A Comment</h2>
      <form method='post' id='form' onSubmit={handleSubmit}>
        <div className='custom-row'>
          <div className='custom-col custom-col-12'>
            <Label
              customCSS={labelStyles.customCSS}
              fontSize={labelStyles.fontSize}
              htmlFor='name'
            >
              Name
            </Label>
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
              value={name}
            />
          </div>
          <div className='custom-col custom-col-12'>
            <Label
              customCSS={labelStyles.customCSS}
              fontSize={labelStyles.fontSize}
              htmlFor='comment'
            >
              Comment
            </Label>
            <TextArea
              customCSS={inputStyles.customCSS}
              fontSize={inputStyles.fontSize}
              color={colors.primary}
              padding={{
                vertical: inputStyles.paddingY,
                horizontal: inputStyles.paddingX,
              }}
              onChange={handleCommentChange}
              name='comment'
              id='comment'
              value={comment}
            ></TextArea>
          </div>
          <div className='custom-col custom-col-12'>
            <Button
              customCSS={buttonStyles.customCSS}
              background={colors.primary}
              color={color}
              name='button'
              type='submit'
            >
              Post your comment
            </Button>
          </div>
        </div>
      </form>
      {notification && (
        <NotificationWrapper>
          <Notification notification={notification}>
            {notification === 'success' ? 'Success!' : 'There was an error.'}
          </Notification>
        </NotificationWrapper>
      )}
    </div>
  );
};

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

const NotificationWrapper = styled.div`
  position: fixed;
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 0;
  left: 0;
`;

const Notification = styled.div`
  padding: 12px 24px;
  background: ${(props) =>
    props.notification === 'success' ? '#00ab66' : '#ff6347'};
  color: white;
  border-radius: 3px;
`;

const Input = styled.input`
  padding-top: ${(props) => props.padding.vertical}px;
  padding-right: ${(props) => props.padding.horizontal}px;
  padding-left: ${(props) => props.padding.horizontal}px;
  padding-bottom: ${(props) => props.padding.vertical}px;
  margin: 0;
  width: 100%;
  border: 1px solid #dfdfdf;
  border-radius: 5px;
  transition-duration: 0.15s;
  :hover {
    border: 1px solid ${(props) => props.color};
  }
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
  font-size: ${(props) => props.fontSize}px !important;
  margin: 0;
  width: 100%;
  transition-duration: 0.15s;
  :hover {
    border: 1px solid ${(props) => props.color};
  }
  border: 1px solid #dfdfdf;
  border-radius: 5px;
  min-height: 200px;
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
