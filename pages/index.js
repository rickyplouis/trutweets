import React, { Component } from 'react';
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
const Storage = require('../controllers/storage');
const Token = require('../controllers/token');

const {
  hasStorage,
  getToken,
  getUser,
  getSecret,
} = Storage;
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
    };
  }

  render() {
    const { user, token, decodedToken } = this.state;
    return (
      <Container activePath={['1']}>
        <Row>
          <Col span={2}>
            <Avatar icon="user" style={{ background: 'darkblue' }} />
          </Col>
          <Col span={22}>
            <TextArea rows={3} placeholder="What's on your mind?" />
          </Col>
        </Row>
        <span style={{ textAlign: '-webkit-right', display: '-webkit-box', paddingTop: '10px' }}>
          <Button>Submit</Button>
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
                avatar={<Avatar icon="user" style={{ background: 'darkblue' }} />}
                description="By some user"
              />
              <span>
                <Progress percent={50} status="active" showInfo={false} style={{ padding: '10px' }} />
                Active for: 50 seconds
              </span>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Index;
