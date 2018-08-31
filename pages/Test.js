import React, { Component } from 'react';

class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: 'Hello from Test',
    };
  }

  render() {
    const { text } = this.state;
    return (
      <div>
        {text}
      </div>
    );
  }
}

export default Test;
