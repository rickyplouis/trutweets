import React from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Button,
  Col,
  Row,
  Input,
} from 'antd';

const { TextArea } = Input;

const PostTweet = ({
  handleTweet,
  currentTweet,
  postTweet,
  getStreak,
  fetchedUser,
}) => (
  <span>
    <Row>
      <Col span={2}>
        <Avatar icon="user" style={{ background: 'darkblue' }} />
      </Col>
      <Col span={22}>
        <TextArea rows={3} placeholder="What's on your mind?" onChange={handleTweet} value={currentTweet} />
      </Col>
    </Row>
    <Col>
      <span style={{
        textAlign: 'center',
        paddingTop: '10px',
        paddingBottom: '10px',
        display: 'block',
      }}
      >
        <h3 style={{ float: 'left' }}>
          {`Reputation: ${fetchedUser.reputation}`}
        </h3>
        <h3 style={{ display: 'inline' }}>
          {`Current Streak: ${getStreak(fetchedUser._id) % 3}`}
        </h3>
        <span style={{ float: 'right' }}>
          {currentTweet.length > 280 && <span style={{ color: 'red' }}>TruTweets must be less than 280 chars </span>}
          <Button
            disabled={currentTweet.length === 0 || currentTweet.length > 280}
            onClick={postTweet}
          >
            Submit
          </Button>
        </span>
      </span>
    </Col>
  </span>
);

export default PostTweet;

PostTweet.propTypes = {
  handleTweet: PropTypes.func.isRequired,
  currentTweet: PropTypes.string,
  postTweet: PropTypes.func.isRequired,
  getStreak: PropTypes.func.isRequired,
  fetchedUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    reputation: PropTypes.number.isRequired,
  }).isRequired,
};

PostTweet.defaultProps = {
  currentTweet: '',
};
