import React from 'react';
import { Icon } from 'antd';
import PropTypes from 'prop-types';

const LeftSpan = ({ children }) => (
  <span style={{ textAlign: '-webkit-left', display: '-webkit-box' }}>
    {children}
  </span>
);

const TweetStatus = ({ upvotes, downvotes }) => (
  <LeftSpan style={{ textAlign: '-webkit-left' }}>
    {
      (upvotes.length > downvotes.length)
      && (
        <LeftSpan>
          <Icon type="check" style={{ color: 'lightgreen', fontSize: '25px' }} />
          {' Valid'}
        </LeftSpan>
      )
    }
    {
      (upvotes.length < downvotes.length) && (
        <LeftSpan>
          <Icon type="close-circle" style={{ color: 'salmon', fontSize: '25px' }} />
          {' Invalid'}
        </LeftSpan>
      )
    }
    {
      (upvotes.length === downvotes.length) && (
        <LeftSpan>
          <Icon type="question-circle" style={{ color: 'grey', fontSize: '25px' }} />
          {' Questionable'}
        </LeftSpan>
      )
    }
  </LeftSpan>
);

export default TweetStatus;

LeftSpan.propTypes = {
  children: PropTypes.node.isRequired,
};

TweetStatus.propTypes = {
  upvotes: PropTypes.node.isRequired,
  downvotes: PropTypes.node.isRequired,
};
