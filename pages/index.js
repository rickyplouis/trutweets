import React, { Component } from 'react';
import Link from 'next/link';
import {
  Layout,
  Menu,
  Progress,
} from 'antd';
import Meta from '../components/Meta';

const { Header, Content, Footer } = Layout;

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
      <div>
        <Meta />
        <Layout>
          <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
            <div className="logo" />
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['1']}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="1">
                <Link href="/" as="/"><a href="/">Home</a></Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link href="/signup" as="/signup"><a href="/signup">Signup</a></Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link href="/login" as="/login"><a href="/login">Login</a></Link>
              </Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '24px 50px', marginTop: 64 }}>
            <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
              <Progress percent={50} status="active" />
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            TruTweets ©2018 Created by Ricardo Pierre-Louis
          </Footer>
        </Layout>
      </div>
    );
  }
}

export default Index;
