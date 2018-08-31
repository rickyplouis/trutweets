import React, { Component } from 'react';
import Link from 'next/link';
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  Icon,
  Progress,
  Row,
} from 'antd';
import { Container, VoteCount, VoteComponent } from '../components/list';

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

const renderIcon = (selectedAnnotation = { upvotes: [], downvotes: [] }, currentUser = '', isLikeIcon) => {
  const { upvotes, downvotes } = selectedAnnotation;
  if (isLikeIcon) {
    return upvotes.indexOf(currentUser) >= 0 ? 'like' : 'like-o';
  }
  return downvotes.indexOf(currentUser) >= 0 ? 'dislike' : 'dislike-o';
};

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

const assignProgress = (trutweets = []) => {
  return trutweets.map((tweet) => {
    tweet.progress = getProgress(tweet)
    return tweet;
  });
};

const handleRep = (_p_user, _p_target, token, action) => {
  /**
  Fetch.getReq(`/api/users?_id=${_p_target}`, token).then((user) => {
    const amount = repAction[action];

    const repBody = {
      _p_user,
      _p_target,
      action,
      amount,
    };

    const userBody = {
      reputation: (user.reputation + amount),
    };

    Promise.all([
      Fetch.putReq(`/api/users?_id=${_p_target}`, userBody, token).then(res => console.log('put user rep', res)),
      Fetch.postReq('/api/reputation', repBody, token).then(res => console.log('posted rep', res)),
    ]);
  });
  **/
  console.log('_p_user', _p_user);
  console.log('_p_target', _p_target);
  console.log('token', token);
  console.log('action', action);
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
    this.checkTweets = this.checkTweets.bind(this);
  }

  componentDidMount() {
    console.log('didmount');
    const { token, trutweets } = this.state;
    const timer = setInterval(this.incrementTweets, 1000);
    const secondTimer = setInterval(this.checkTweets, 3000);
    if (trutweets.length === 0) {
      getReq('/api/trutweets', token).then((tweets) => {
        console.log('getAll from mount');
        if (Array.isArray(tweets)) {
          tweets = assignProgress(tweets);
          this.setState(prevState => ({
            ...prevState,
            trutweets: tweets,
            timer,
          }));
        }
      });
    } else {
      this.setState(prevState => ({
        ...prevState,
        secondTimer,
        timer,
      }));
    }
  }

  componentWillUnmount() {
    console.log('willunmount');
    const { timer, secondTimer } = this.state;
    clearInterval(timer);
    clearInterval(secondTimer);
  }

  checkTweets() {
    const { trutweets, token } = this.state;
    Fetch.getReq('/api/trutweets', token).then((res) => {
      if (res.length !== trutweets.length) {
        this.setState(prevState => ({
          ...prevState,
          trutweets: res,
        }));
      }
    });
  }

  incrementTweets() {
    const { trutweets, token } = this.state;
    if (Array.isArray(trutweets)) {
      const newTweets = trutweets.map((tweet) => {
        let tweetCopy = Object.assign({}, tweet);
        if (tweetCopy.progress !== 100) {
          Fetch.getReq(`/api/trutweets?_id=${tweet._id}`, token).then((res) => {
            if (tweetCopy.upvotes !== res.upvotes) {
              tweetCopy = Object.assign(tweetCopy, { upvotes: res.upvotes });
            }
            if (tweetCopy.downvotes !== res.downvotes) {
              tweetCopy = Object.assign(tweetCopy, { downvotes: res.downvotes });
            }
          });
          tweetCopy.progress = getProgress(tweetCopy);
        }
        return tweetCopy;
      });
      this.setState(prevState => ({
        ...prevState,
        trutweets: newTweets,
      }));
    }
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

  handleVote(isUpvote, addingVote, index, selectedTweet) {
    const voteType = isUpvote ? 'upvotes' : 'downvotes';
    const { token, user } = this.state;
    let body = {};
    if (addingVote) {
      // add up or downvote
      selectedTweet[voteType].push(user);
    } else {
      // removing up or downvote
      selectedTweet[voteType].splice(index, 1);
    }
    body = {
      upvotes: selectedTweet.upvotes,
      downvotes: selectedTweet.downvotes,
    };
    this.putVote(body, selectedTweet, token);
  }

  putVote(body, selectedTweet, token) {
    // this.handleProp(selectedAnnotation, 'selectedAnnotation');
    Fetch.putReq(`/api/trutweets?_id=${selectedTweet._id}`, body, token);
  }


  vote(evt, isUpvote, selectedTweet) {
    evt.preventDefault();
    const { user, token } = this.state;
    const upvoteIndex = selectedTweet.upvotes.indexOf(user);
    const downvoteIndex = selectedTweet.downvotes.indexOf(user);
    let annotationBody = {};

    const alreadyUpvoted = () => upvoteIndex >= 0;
    const alreadyDownvoted = () => downvoteIndex >= 0;

    const voteBody = {
      _p_user: user,
      _p_annotation: selectedTweet._id,
      upvote: isUpvote,
      downvote: !isUpvote,
      dateCreated: new Date(),
    };

    if (isUpvote) {
      if (alreadyUpvoted()) {
        // isupvote and user already upvoted
        Fetch.postReq('/api/votes', voteBody, token);
        this.handleVote(isUpvote, false, upvoteIndex, selectedTweet);
        handleRep(user, selectedTweet.creator, token, 'REMOVE_UPVOTE');
      } else if (alreadyDownvoted()) {
        // isupvote and user already downvoted
        // remove downvote and add upvote
        selectedTweet.downvotes.splice(downvoteIndex, 1);
        selectedTweet.upvotes.push(user);
        annotationBody = {
          downvotes: selectedTweet.downvotes,
          upvotes: selectedTweet.upvotes,
        };
        Fetch.postReq('/api/votes', voteBody, token);
        this.putVote(annotationBody, selectedTweet, token);
        handleRep(user, selectedTweet.creator, token, 'UPVOTE');
      } else {
        // is upvote and user not yet voted
        this.handleVote(isUpvote, true, upvoteIndex, selectedTweet);
        Fetch.postReq('/api/votes', voteBody, token);
        handleRep(user, selectedTweet.creator, token, 'UPVOTE');
      }
    } else if (alreadyDownvoted()) {
      // is downvote and user alreadyDownvoted
      Fetch.postReq('/api/votes', voteBody, token);
      this.handleVote(isUpvote, false, downvoteIndex, selectedTweet);
      handleRep(user, selectedTweet.creator, token, 'REMOVE_DOWNVOTE');
    } else if (alreadyUpvoted()) {
      // isupvote and user already downvoted
      // remove upvote and add downvote
      selectedTweet.upvotes.splice(upvoteIndex, 1);
      selectedTweet.downvotes.push(user);
      annotationBody = {
        upvotes: selectedTweet.upvotes,
        downvotes: selectedTweet.downvotes,
      };
      Fetch.postReq('/api/votes', voteBody, token);
      this.putVote(annotationBody, selectedTweet, token);
      handleRep(user, selectedTweet.creator, token, 'DOWNVOTE');
    } else {
      // is downvote and user note yet voted
      this.handleVote(isUpvote, true, downvoteIndex, selectedTweet);
      Fetch.postReq('/api/votes', voteBody, token);
      handleRep(user, selectedTweet.creator, token, 'DOWNVOTE');
    }
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
        console.log('postTweet');
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
                    .sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart))
                    .slice(0, 10)
                    .map(tweet => (
                      <Row style={{ paddingTop: '10px' }} key={tweet._id}>
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
                                  <div>
                                    <Progress
                                      percent={tweet.progress}
                                      status="active"
                                      showInfo={false}
                                      style={{ padding: '10px' }}
                                    />
                                    <VoteComponent
                                      token={token}
                                      upvoteType={renderIcon(tweet, user, true)}
                                      downvoteType={renderIcon(tweet, user, false)}
                                      onUpvote={evt => this.vote(evt, true, tweet)}
                                      onDownvote={evt => this.vote(evt, false, tweet)}
                                    >
                                      <VoteCount tweet={tweet} />
                                    </VoteComponent>
                                  </div>
                                ) : (
                                  <span>
                                    {
                                      (tweet.upvotes.length > tweet.downvotes.length)
                                      && (
                                        <span>
                                          <Icon type="check" style={{ color: 'lightgreen', fontSize: '25px' }} />
                                          {' Valid'}
                                        </span>
                                      )
                                    }
                                    {
                                      (tweet.upvotes.length < tweet.downvotes.length) && (
                                        <span>
                                          <Icon type="close-circle" style={{ color: 'salmon', fontSize: '25px' }} />
                                          {' Invalid'}
                                        </span>
                                      )
                                    }
                                    {
                                      (tweet.upvotes.length === tweet.downvotes.length) && (
                                        <span>
                                          <Icon type="question-circle" style={{ color: 'grey', fontSize: '25px' }} />
                                          {' Questionable'}
                                        </span>
                                      )
                                    }
                                  </span>
                                )
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
