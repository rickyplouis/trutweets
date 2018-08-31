import React, { Component } from 'react';
import Link from 'next/link';
import {
  Avatar,
  Button,
  Card,
  Col,
  Icon,
  Input,
  Progress,
  Row,
} from 'antd';
import { Container } from '../components/list';

const { Meta } = Card;
const moment = require('moment');
const Storage = require('../controllers/storage');
const Token = require('../controllers/token');

const {
  hasStorage,
  getToken,
  getUser,
  getSecret,
} = Storage;

const Fetch = require('../controllers/fetch');

const { postReq, getReq } = Fetch;
const { TextArea } = Input;

const getProgress = (tweet) => {
  let { timeStart, timeEnd } = tweet;
  const now = moment(new Date());
  timeStart = moment(timeStart);
  timeEnd = moment(timeEnd);
  if (now > timeEnd) {
    return 100;
  }
  const duration = moment.duration(timeEnd.diff(timeStart));
  const totalSeconds = duration.asSeconds();
  const timePassed = moment.duration(now.diff(timeStart)).asSeconds();
  return (timePassed / totalSeconds) * 100;
};

const assignProgress = (trutweets) => {
  return trutweets.map((tweet) => {
    tweet.progress = getProgress(tweet)
    return tweet;
  });
};

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

class Index extends Component {
  constructor(props) {
    super(props);
    let user = '';
    let token = '';
    let decodedToken = '';
    if (hasStorage()) {
      token = getToken();
      user = getUser();
      decodedToken = Token.decodeToken(token, getSecret());
    }

    this.state = {
      user,
      token,
      decodedToken,
      trutweets: [],
      currentTweet: '',
    };
    this.handleTweet = this.handleTweet.bind(this);
    this.handleProp = this.handleProp.bind(this);
    this.postTweet = this.postTweet.bind(this);
    this.incrementTweets = this.incrementTweets.bind(this);
  }

  componentDidMount() {
    const { token, trutweets } = this.state;
    const timer = setInterval(this.incrementTweets, 1000);
    if (trutweets.length === 0) {
      getReq('/api/trutweets', token).then((tweets) => {
        tweets = assignProgress(tweets);
        this.setState(prevState => ({
          ...prevState,
          trutweets: tweets,
          timer,
        }));
      });
    } else {
      this.setState(prevState => ({
        ...prevState,
        timer,
      }));
    }
  }

  componentWillUnmount() {
    console.log('willunmount');
    const { timer } = this.state;
    this.clearInterval(timer);
  }

  incrementTweets() {
    const { trutweets } = this.state;
    const newTweets = trutweets.map((tweet) => {
      if (tweet.progress < 100) {
        tweet.progress = getProgress(tweet);
      }
      return tweet;
    });
    this.setState(prevState => ({
      ...prevState,
      trutweets: newTweets,
    }));
  }

  handleProp(val, name) {
    this.setState(prevState => ({
      ...prevState,
      [name]: val,
    }));
  }

  handleTweet(evt) {
    this.handleProp(evt.target.value, 'currentTweet');
  }

  postTweet() {
    const { currentTweet, user, token } = this.state;
    const now = new Date();
    const truTweet = {
      text: currentTweet,
      creator: user,
      timeStart: now,
      timeEnd: moment(now).add(30, 's').toDate(),
      upvotes: [],
      downvotes: [],
      status: 'inProgress',
      progress: 0,
    };
    postReq('/api/trutweets', truTweet, token).then(() => {
      getReq('/api/trutweets', token).then((trutweets) => {
        trutweets = assignProgress(trutweets);
        this.setState(prevState => ({
          ...prevState,
          trutweets,
          currentTweet: '',
        }));
      });
    })
  }

  render() {
    console.log('render');
    const {
      user,
      decodedToken,
      token,
      trutweets,
      currentTweet,
    } = this.state;
    return (
      <div>
        {
          decodedToken && user.length > 0
            ? (
              <Container activePath={['1']}>
                <PostTweet
                  currentTweet={currentTweet}
                  handleTweet={this.handleTweet}
                />
                <span style={{ textAlign: '-webkit-right', display: '-webkit-box', paddingTop: '10px' }}>
                  {currentTweet.length > 280 && <span style={{ color: 'red' }}>TruTweets must be less than 280 chars </span>}
                  <Button
                    disabled={currentTweet.length === 0 || currentTweet.length > 280}
                    onClick={this.postTweet}
                  >
                    Submit
                  </Button>
                </span>
                { token && trutweets.length > 0 ? (
                  trutweets
                    .sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart)).map(tweet => (
                      <Row style={{ paddingTop: '10px' }}>
                        <Col span={24}>
                          <Card
                            style={{ width: '100%' }}
                          >
                            <h3 style={{ textAlign: '-webkit-left', padding: '10px' }}>
                              {tweet.text}
                            </h3>
                            <Meta
                              style={{ paddingLeft: '10px' }}
                              avatar={<Avatar icon="user" style={{ background: 'darkblue' }} />}
                              description={`By ${tweet.creator}`}
                            />
                            <span>
                              {
                                tweet.progress !== 100 ? (
                                  <Progress
                                    percent={tweet.progress}
                                    status="active"
                                    showInfo={false}
                                    style={{ padding: '10px' }}
                                  />
                                ) : <span>Voting Complete</span>
                              }
                            </span>
                          </Card>
                        </Col>
                      </Row>
                    ))
                ) : (
                  <div>Loading Tweets</div>
                )
              }
              </Container>
            ) : (
              <Container activePath={['1']}>
                <Link href="/login" as="/login"><a href="/Login">Login</a></Link>
                or
                <Link href="/signup" as="/signup"><a href="/signup">Signup</a></Link>
                to begin using TruTweets
              </Container>
            )
        }
      </div>
    );
  }
}

export default Index;
