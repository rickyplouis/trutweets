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
      currentTweet: '',
    };
    this.handleTweet = this.handleTweet.bind(this);
    this.handleProp = this.handleProp.bind(this);
    this.postTweet = this.postTweet.bind(this);
  }

  componentDidMount() {
    const { token } = this.state;
    getReq('/api/trutweets', token).then((res) => {
      console.log('res', res);
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
    };
    postReq('/api/trutweets', truTweet, token).then(res => console.log('res', res));
    this.setState(prevState => ({
      ...prevState,
      currentTweet: '',
    }));
  }

  render() {
    const {
      user,
      decodedToken,
      currentTweet,
    } = this.state;
    return (
      <div>
        {
          decodedToken && user.length > 0
            ? (
              <Container activePath={['1']}>
                <Row>
                  <Col span={2}>
                    <Avatar icon="user" style={{ background: 'darkblue' }} />
                  </Col>
                  <Col span={22}>
                    <TextArea rows={3} placeholder="What's on your mind?" onChange={this.handleTweet} />
                  </Col>
                </Row>
                <span style={{ textAlign: '-webkit-right', display: '-webkit-box', paddingTop: '10px' }}>
                  {currentTweet.length > 280 && <span style={{ color: 'red' }}>TruTweets must be less than 280 chars </span>}
                  <Button
                    disabled={currentTweet.length === 0 || currentTweet.length > 280}
                    onClick={this.postTweet}
                  >
                    Submit
                  </Button>
                </span>
                <Row style={{ paddingTop: '10px' }}>
                  <Col span={24}>
                    <Card
                      style={{ width: '100%' }}
                      actions={[<Icon type="setting" />, <Icon type="edit" />, <Icon type="ellipsis" />]}
                    >
                      <h3 style={{ textAlign: '-webkit-left', padding: '10px' }}>
                        Insert some provocative tweet here that the user can vote up or down
                      </h3>
                      <Meta
                        style={{ paddingLeft: '10px' }}
                        avatar={<Avatar icon="user" style={{ background: 'darkblue' }} />}
                        description="By some user"
                      />
                      <span>
                        <Progress percent={50} status="active" showInfo={false} style={{ padding: '10px' }} />
                      </span>
                    </Card>
                  </Col>
                </Row>
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
