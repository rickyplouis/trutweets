import React from 'react';
import Link from 'next/link';

export default () => (
  <div>
    <li>
      <Link href="/a" as="/a"><a href="/a">a</a></Link>
    </li>
    <li><Link href="/b" as="/b"><a href="/b">b</a></Link></li>
  </div>
);
