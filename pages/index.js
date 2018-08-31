import React, { Component } from 'react';
import {
  Progress,
} from 'antd';

import { Container } from '../components/list';

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: 'Hello from Index',
    };
  }

  render() {
    const { text } = this.state;
    return (
      <Container activePath={['1']}>
        <Progress percent={50} status="active" />
      </Container>
    );
  }
}

export default Index;
