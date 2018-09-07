import React from 'react';
import { Button } from 'antd';
import Link from 'next/link';
import Container from './Container';

const LandingContainer = () => (
  <Container activePath={['1']}>
    <h2 style={{ textAlign: 'center' }}>
      Welcome to TruTweets
    </h2>
    <div style={{ margin: '0 auto', textAlign: '-webkit-center' }}>
      <span style={{ paddingRight: '10px' }}>
        <Link href="/login" as="/login"><a href="/login"><Button type="primary">Login</Button></a></Link>
      </span>
      <span>
        <Link href="/signup" as="/signup"><a href="/signup"><Button>Signup</Button></a></Link>
      </span>
    </div>
  </Container>
);

export default LandingContainer;
