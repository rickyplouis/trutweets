import React from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Col,
  Card,
  Row,
} from 'antd';

const { Meta } = Card;


const TweetContainer = ({ tweet, children }) => (
  <Row style={{ paddingTop: '10px' }} key={tweet._id}>
    <Col span={24}>
      <Card
        style={{ width: '100%' }}
      >
        <h3 style={{ textAlign: '-webkit-left', padding: '10px' }}>
          {tweet.text}
        </h3>
        <Meta
          style={{ paddingLeft: '10px', textAlign: '-webkit-left' }}
          avatar={<Avatar icon="user" style={{ background: 'darkblue' }} />}
          description={`By ${tweet.creatorName}`}
        />
        {children}
      </Card>
    </Col>
  </Row>
);

export default TweetContainer;

TweetContainer.propTypes = {
  tweet: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    creatorName: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};
