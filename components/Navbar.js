import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import {
  Menu,
  Layout,
} from 'antd';

const { Header } = Layout;

const Navbar = ({ activePath }) => (
  <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
    <div className="logo" />
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={activePath}
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
);

export default Navbar;

Navbar.propTypes = {
  activePath: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};
