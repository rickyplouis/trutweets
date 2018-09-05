import React, { Component } from 'react';
import Link from 'next/link';
import {
  Avatar,
  Button,
  Card,
  Col,
  Icon,
  Progress,
  Row,
} from 'antd';
import {
  Container,
  PostTweet,
  VoteCount,
  VoteComponent,
} from '../components/list';

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

const assignProgress = (trutweets = []) => trutweets.map((tweet) => {
  const tweetCopy = Object.assign({}, tweet, { progress: getProgress(tweet) });
  return tweetCopy;
});

const add24Hours = date => moment(date).add(24, 'hours').format('dddd, MMMM Do YYYY, h:mm:ss a');


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
      fetchedUser: {},
    };
    this.handleTweet = this.handleTweet.bind(this);
    this.handleProp = this.handleProp.bind(this);
    this.postTweet = this.postTweet.bind(this);
    this.incrementTweets = this.incrementTweets.bind(this);
    this.checkTweets = this.checkTweets.bind(this);
    this.awardWinners = this.awardWinners.bind(this);
    this.penalizeLosers = this.penalizeLosers.bind(this);
  }

  componentDidMount() {
    const {
      token,
      trutweets,
      fetchedUser,
      user,
    } = this.state;
    const timer = setInterval(this.incrementTweets, 1000);
    const secondTimer = setInterval(this.checkTweets, 3000);

    if (Object.keys(fetchedUser).length === 0) {
      Fetch.getReq(`/api/users?_id=${user}`, token).then((res) => {
        this.setState(prevState => ({
          ...prevState,
          fetchedUser: res,
        }));
      });
    }

    if (trutweets.length === 0) {
      getReq('/api/trutweets', token).then((tweets) => {
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
    const { timer, secondTimer } = this.state;
    clearInterval(timer);
    clearInterval(secondTimer);
  }

  getStreak(user) {
    let { trutweets } = this.state;
    let streak = 0;
    trutweets = trutweets.sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart));
    for (let x = 0; x < trutweets.length; x += 1) {
      const { upvotes, downvotes } = trutweets[x];
      if (upvotes.length > downvotes.length) {
        if (upvotes.indexOf(user) >= 0) {
          streak += 1;
        }
        if (downvotes.indexOf(user) >= 0) {
          return streak;
        }
      }

      if (downvotes.length > upvotes.length) {
        if (downvotes.indexOf(user) >= 0) {
          streak += 1;
        }
        if (upvotes.indexOf(user) >= 0) {
          return streak;
        }
      }
    }
    return streak;
  }

  getLastTweet(user) {
    let { trutweets } = this.state;
    if (Array.isArray(trutweets) && trutweets.length > 0) {
      trutweets = trutweets.sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart));
      for (let x = 0; x < trutweets.length; x += 1) {
        const currentTweet = trutweets[x];
        const { upvotes, downvotes } = currentTweet;
        if (upvotes.indexOf(user) >= 0 || downvotes.indexOf(user) >= 0) {
          return currentTweet.timeStart;
        }
      }
    }
    return false;
  }

  incrementTweets() {
    const {
      trutweets,
      token,
    } = this.state;
    if (Array.isArray(trutweets)) {
      const newTweets = trutweets.map((tweet) => {
        const tweetCopy = Object.assign({}, tweet);
        if (tweetCopy.progress !== 100) {
          Fetch.getReq(`/api/trutweets?_id=${tweet._id}`, token).then((res) => {
            if (tweetCopy.upvotes !== res.upvotes) {
              tweetCopy.upvotes = res.upvotes;
            }
            if (tweetCopy.downvotes !== res.downvotes) {
              tweetCopy.downvotes = res.downvotes;
            }
          });
          tweetCopy.progress = getProgress(tweetCopy);
        } else if (tweetCopy.progress === 100 && tweetCopy.status === 'inProgress') {
          const body = {
            status: 'completed',
          };
          Fetch.putReq(`/api/trutweets?_id=${tweet._id}`, body, token).then(() => {
            Fetch.getReq('/api/trutweets', token).then((res) => {
              let winners = [];
              let losers = [];
              if (tweetCopy.upvotes.length > tweetCopy.downvotes.length) {
                winners = tweetCopy.upvotes;
                losers = tweetCopy.downvotes;
              } else if (tweetCopy.downvotes.length > tweetCopy.upvotes.length) {
                winners = tweetCopy.downvotes;
                losers = tweetCopy.upvotes;
              }
              this.awardWinners(winners);
              this.penalizeLosers(losers);
              this.setState(prevState => ({
                ...prevState,
                trutweets: res,
              }));
            });
          });
        }
        return tweetCopy;
      });
      this.setState(prevState => ({
        ...prevState,
        trutweets: newTweets,
      }));
    }
  }

  penalizeLosers(loserArray) {
    const { token, user } = this.state;
    if (loserArray.indexOf(user) >= 0) {
      Fetch.getReq(`/api/users?_id=${user}`, token).then((userRes) => {
        const body = {
          reputation: userRes.reputation - 10,
        };
        Fetch.putReq(`/api/users?_id=${user}`, body, token).then((res) => {
          this.setState(prevState => ({
            ...prevState,
            fetchedUser: res,
          }));
        });
      });
    }
  }


  awardWinners(winnerArray) {
    const { token, user } = this.state;
    let points = 0;
    if (winnerArray.indexOf(user) >= 0) {
      const streak = this.getStreak(user);
      if (streak > 3) {
        const adjustedStreak = streak % 3;
        if (adjustedStreak === 0) {
          points = 50;
        }
        if (adjustedStreak === 1) {
          points = 10;
        }
        if (adjustedStreak === 2) {
          points = 20;
        }
      } else {
        if (streak === 1) {
          points = 10;
        }
        if (streak === 2) {
          points = 20;
        }
        if (streak === 3) {
          points = 50;
        }
      }
      const body = {
        reputation: points,
      };
      Fetch.putReq(`/api/users?_id=${user}`, body, token).then((res) => {
        this.setState(prevState => ({
          ...prevState,
          fetchedUser: res,
        }));
      });
    }
  }

  checkTweets() {
    const {
      trutweets,
      token,
      user,
      fetchedUser,
    } = this.state;
    if (trutweets) {
      const replenishDate = moment(this.getLastTweet(user)).add(24, 'hours');
      const now = new Date();
      if (fetchedUser.reputation <= 0 && moment(now).isAfter(replenishDate)) {
        const body = {
          reputation: 10,
        };
        Fetch.putReq(`/api/users?_id=${user}`, body, token).then((res) => {
          this.setState(prevState => ({
            ...prevState,
            fetchedUser: res,
          }));
        });
      }
    }
    Fetch.getReq('/api/trutweets', token).then((res) => {
      if (res.length !== trutweets.length) {
        this.setState(prevState => ({
          ...prevState,
          trutweets: res,
        }));
      }
    });
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
      } else {
        // is upvote and user not yet voted
        this.handleVote(isUpvote, true, upvoteIndex, selectedTweet);
        Fetch.postReq('/api/votes', voteBody, token);
      }
    } else if (alreadyDownvoted()) {
      // is downvote and user alreadyDownvoted
      Fetch.postReq('/api/votes', voteBody, token);
      this.handleVote(isUpvote, false, downvoteIndex, selectedTweet);
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
    } else {
      // is downvote and user note yet voted
      this.handleVote(isUpvote, true, downvoteIndex, selectedTweet);
      Fetch.postReq('/api/votes', voteBody, token);
    }
  }

  postTweet() {
    const {
      currentTweet,
      user,
      fetchedUser,
      token,
    } = this.state;
    const now = new Date();
    const truTweet = {
      text: currentTweet,
      creator: user,
      creatorName: fetchedUser.name,
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
    });
  }

  render() {
    const {
      user,
      decodedToken,
      token,
      trutweets,
      currentTweet,
      fetchedUser,
    } = this.state;
    return (
      <div>
        {
          decodedToken && user.length > 0
            ? (
              <Container activePath={['1']}>
                <Row>
                  <Col span={24}>
                    <PostTweet
                      currentTweet={currentTweet}
                      handleTweet={this.handleTweet}
                    />
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
                        {`Current Streak: ${this.getStreak(fetchedUser._id)}`}
                      </h3>
                      <span style={{ float: 'right' }}>
                        {currentTweet.length > 280 && <span style={{ color: 'red' }}>TruTweets must be less than 280 chars </span>}
                        <Button
                          disabled={currentTweet.length === 0 || currentTweet.length > 280}
                          onClick={this.postTweet}
                        >
                            Submit
                        </Button>
                      </span>
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
                                  description={`By ${tweet.creatorName}`}
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
                                        {
                                          fetchedUser.reputation > 0
                                            ? (
                                              <VoteComponent
                                                token={token}
                                                upvoteType={renderIcon(tweet, user, true)}
                                                downvoteType={renderIcon(tweet, user, false)}
                                                onUpvote={evt => this.vote(evt, true, tweet)}
                                                onDownvote={evt => this.vote(evt, false, tweet)}
                                              >
                                                <VoteCount tweet={tweet} />
                                              </VoteComponent>
                                            ) : (
                                              <div>
                                                {`Your karma is too low you can't vote again until ${add24Hours(this.getLastTweet(user))}`}
                                              </div>
                                            )
                                        }
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
                  </Col>
                </Row>
              </Container>
            ) : (
              <Container activePath={['1']}>
                <h2 style={{ textAlign: 'center' }}>
                  Welcome to TruTweets
                </h2>
                <div style={{ margin: '0 auto', textAlign: '-webkit-center' }}>
                  <span style={{ paddingRight: '10px' }}>
                    <Link href="/login" as="/login"><a href="/Login"><Button type="primary">Login</Button></a></Link>
                  </span>
                  <span>
                    <Link href="/signup" as="/signup"><a href="/signup"><Button>Signup</Button></a></Link>
                  </span>
                </div>
              </Container>
            )
        }
      </div>
    );
  }
}

export default Index;
