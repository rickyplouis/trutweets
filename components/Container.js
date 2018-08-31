import React from 'react';
import PropTypes from 'prop-types';
import {
  Layout,
} from 'antd';
import Meta from './Meta';
import Navbar from './Navbar';

const { Content, Footer } = Layout;

const Container = ({ children, activePath }) => (
  <Layout>
    <Navbar activePath={activePath} />
    <Meta />
    <Content style={{ padding: '24px 50px', marginTop: 64 }}>
      <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
        {children}
      </div>
    </Content>
    <Footer style={{ textAlign: 'center' }}>
      TruTweets ©2018 Created by Ricardo Pierre-Louis
    </Footer>
  </Layout>
);

export default Container;

Container.propTypes = {
  children: PropTypes.node.isRequired,
  activePath: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};
