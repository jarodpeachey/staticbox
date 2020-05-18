/* eslint-disable import/prefer-default-export */
import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import './css/style.css';
import { TriangleContext } from './Triangle';

function encode(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

export const Form = () => {
  const { faunaClient, q, color } = window.triangle;
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  console.log(window.triangle);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    faunaClient
      .query(
        q.Let(
          {
            user: q.Get(q.Match(q.Index('all_users'))),
            site: q.Get(q.Match(q.Index('all_sites'))),
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
              q.Var('user'),
              q.Var('site'),
              false
            ),
          }
        )
      )
      .then((response) => console.log(response))
      .catch((error) => console.log(error));
  };

  return (
    <div className='wrapper'>
      <h2>Add A Comment</h2>
      <form method='post' id='form' onSubmit={handleSubmit}>
        <div className='custom-row'>
          <div className='custom-col custom-col-12'>
            <Label htmlFor='name'>Name</Label>
            <Input
              color={color}
              onChange={handleNameChange}
              type='text'
              name='name'
              id='name'
              value={name}
            />
          </div>
          <div className='custom-col custom-col-12'>
            <Label htmlFor='comment'>Comment</Label>
            <TextArea
              color={color}
              onChange={handleCommentChange}
              name='comment'
              id='comment'
              value={comment}
            ></TextArea>
          </div>
          <div className='custom-col custom-col-12'>
            <Button color={color} name='button' type='submit'>
              Post your comment
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

const Label = styled.label`
  margin-bottom: 8px !important;
  display: block !important;
  font-weight: 500 !important;
`;

const Input = styled.input`
  padding: 14px !important;
  border: 2px solid transparent;
  box-shadow: 1px 1px 3px 0px #e7e7e7 !important;
  font-size: 16px !important;
  outline: none !important;
  width: 100% !important;
  background: #f7f7f7;
  :focus {
    border: 2px solid ${(props) => props.color} !important;
  }
`;

const TextArea = styled.textarea`
  padding: 14px !important;
  border: 2px solid transparent;
  box-shadow: 1px 1px 3px 0px #e7e7e7 !important;
  font-size: 16px !important;
  outline: none !important;
  width: 100% !important;
  background: #f7f7f7;
  :focus {
    border: 2px solid ${(props) => props.color} !important;
  }
  min-height: 125px !important;
  resize: vertical !important;
`;

const Button = styled.button`
  margin: 0 !important;
  margin-left: auto !important;
  display: block !important;
  background: ${(props) => props.color} !important;
  color: white !important;
  text-transform: uppercase !important;
  color: white !important;
  cursor: pointer;
  padding: 14px 28px !important;
  border: none !important;
  transition-duration: 0.4s !important;
  :hover {
    background: ${(props) => props.color}d9 !important;
    transition-duration: 0.4s !important;
    box-shadow: 4px 5px 20px 0px #66666610 !important;
    transform: scale(1.04) !important;
  }
`;
