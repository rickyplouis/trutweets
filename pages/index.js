import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Progress } from 'antd';

export default () => (
  <div>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <link rel="stylesheet" href="/_next/static/style.css" />
    </Head>
    <Progress percent={50} status="active" />
    <li>
      <Link href="/a" as="/a"><a href="/a">a</a></Link>
    </li>
    <li><Link href="/b" as="/b"><a href="/b">b</a></Link></li>
  </div>
);
