import React, { Component } from 'react';
import Link from 'next/link';
import {
  Avatar,
  Button,
  Card,
  Col,
  Progress,
  Row,
} from 'antd';
import {
  Container,
  PostTweet,
  TweetStatus,
  VoteCount,
  VoteComponent,
} from '../components/list';

const { Meta } = Card;
const moment = require('moment');
const Storage = require('../controllers/storage');
const Token = require('../controllers/token');
const Time = require('../controllers/time');
const TweetController = require('../controllers/tweet');
const VoteController = require('../controllers/vote');

const { getAllTweets } = TweetController;

const {
  getStreak,
  getPoints,
  handleVote,
  putVote,
  renderIcon,
} = VoteController;

const {
  add24Hours,
  getProgress,
  assignProgress,
} = Time;

const {
  hasStorage,
  getToken,
  getUser,
  getSecret,
} = Storage;

const Fetch = require('../controllers/fetch');

const { postReq } = Fetch;

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
    this.awardWinners = this.awardWinners.bind(this);
    this.checkTweets = this.checkTweets.bind(this);
    this.handleTweet = this.handleTweet.bind(this);
    this.handleProp = this.handleProp.bind(this);
    this.incrementTweets = this.incrementTweets.bind(this);
    this.penalizeLosers = this.penalizeLosers.bind(this);
    this.postTweet = this.postTweet.bind(this);
    this.updateUser = this.updateUser.bind(this);
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
      getAllTweets(token).then((tweets) => {
        if (Array.isArray(tweets)) {
          const updatedTweets = assignProgress(tweets);
          this.setState(prevState => ({
            ...prevState,
            trutweets: updatedTweets,
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

  getLastTweet(user) {
    const { trutweets } = this.state;
    if (Array.isArray(trutweets) && trutweets.length > 0) {
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

  updateUser(body) {
    const { token, user } = this.state;
    Fetch.putReq(`/api/users?_id=${user}`, body, token).then((res) => {
      this.setState(prevState => ({
        ...prevState,
        fetchedUser: res,
      }));
    });
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
            tweetCopy.upvotes = res.upvotes;
            tweetCopy.downvotes = res.downvotes;
          });
          tweetCopy.progress = getProgress(tweetCopy);
        } else if (tweetCopy.progress === 100 && tweetCopy.status === 'inProgress') {
          const body = {
            status: 'completed',
          };
          Fetch.putReq(`/api/trutweets?_id=${tweet._id}`, body, token).then(() => {
            getAllTweets(token).then((res) => {
              const { upvotes, downvotes } = tweetCopy;
              const winners = upvotes.length > downvotes.length ? upvotes : downvotes;
              const losers = upvotes.length > downvotes.length ? downvotes : upvotes;
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
    const { user, fetchedUser } = this.state;
    if (loserArray.indexOf(user) >= 0) {
      const body = {
        reputation: fetchedUser.reputation - 10,
      };
      this.updateUser(body);
    }
  }

  awardWinners(winnerArray) {
    const { user, fetchedUser, trutweets } = this.state;
    if (winnerArray.indexOf(user) >= 0) {
      const streak = getStreak(user, trutweets);
      const body = {
        reputation: fetchedUser.reputation + getPoints(streak),
      };
      this.updateUser(body);
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
        this.updateUser(body);
      }
    }
    getAllTweets(token).then((res) => {
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
        annotationBody = handleVote(isUpvote, false, selectedTweet, user);
      } else if (alreadyDownvoted()) {
        selectedTweet.downvotes.splice(downvoteIndex, 1);
        selectedTweet.upvotes.push(user);
        annotationBody = {
          downvotes: selectedTweet.downvotes,
          upvotes: selectedTweet.upvotes,
        };
      } else {
        annotationBody = handleVote(isUpvote, true, selectedTweet, user);
      }
    } else if (alreadyDownvoted()) {
      annotationBody = handleVote(isUpvote, false, selectedTweet, user);
    } else if (alreadyUpvoted()) {
      selectedTweet.upvotes.splice(upvoteIndex, 1);
      selectedTweet.downvotes.push(user);
      annotationBody = {
        upvotes: selectedTweet.upvotes,
        downvotes: selectedTweet.downvotes,
      };
    } else {
      annotationBody = handleVote(isUpvote, true, selectedTweet, user);
    }
    Promise.all([
      putVote(annotationBody, selectedTweet, token),
      postReq('/api/votes', voteBody, token),
    ]);
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
      getAllTweets(token).then((trutweets) => {
        const updatedTweets = assignProgress(trutweets);
        this.setState(prevState => ({
          ...prevState,
          trutweets: updatedTweets,
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
      currentTweet,
      fetchedUser,
    } = this.state;
    let { trutweets } = this.state;
    trutweets = trutweets.slice(0, 10);
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
                      postTweet={this.postTweet}
                      currentStreak={getStreak(fetchedUser._id, trutweets) % 4}
                      fetchedUser={fetchedUser}
                    />
                    { token && trutweets.length > 0 ? (
                      trutweets
                        .map(tweet => (
                          <TweetContainer
                            tweet={tweet}
                          >
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
                                  <TweetStatus
                                    upvotes={tweet.upvotes}
                                    downvotes={tweet.downvotes}
                                  />
                                )
                              }
                            </span>
                          </TweetContainer>
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
