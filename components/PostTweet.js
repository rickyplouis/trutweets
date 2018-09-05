import React from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Col,
  Row,
  Input,
} from 'antd';

const { TextArea } = Input;

const PostTweet = ({ handleTweet, currentTweet }) => (
  <Row>
    <Col span={2}>
      <Avatar icon="user" style={{ background: 'darkblue' }} />
    </Col>
    <Col span={22}>
      <TextArea rows={3} placeholder="What's on your mind?" onChange={handleTweet} value={currentTweet} />
    </Col>
  </Row>
);

export default PostTweet;

PostTweet.propTypes = {
  handleTweet: PropTypes.func.isRequired,
  currentTweet: PropTypes.string,
};

PostTweet.defaultProps = {
  currentTweet: '',
};
