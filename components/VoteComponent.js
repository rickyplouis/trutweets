import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Modal } from 'antd';

const mustLogin = () => Modal.warning({ title: 'No Account Detected', content: 'You must login before you vote on annotations' });

export default class VoteComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      upvoteStyle: { color: 'gray' },
      downvoteStyle: { color: 'gray' },
    };
    this.toggleDownvoteColor = this.toggleDownvoteColor.bind(this);
    this.toggleUpvoteColor = this.toggleUpvoteColor.bind(this);
  }

  toggleUpvoteColor() {
    const { upvoteStyle } = this.state;
    const color = upvoteStyle.color === 'gray' ? 'lightgreen' : 'gray';
    this.setState(prevState => ({
      ...prevState,
      upvoteStyle: {
        color,
      },
    }));
  }

  toggleDownvoteColor() {
    const { downvoteStyle } = this.state;
    const color = downvoteStyle.color === 'gray' ? 'lightblue' : 'gray';
    this.setState(prevState => ({
      ...prevState,
      downvoteStyle: {
        color,
      },
    }));
  }


  render() {
    const {
      upvoteType,
      onUpvote,
      downvoteType,
      onDownvote,
      children,
      token,
    } = this.props;
    const { upvoteStyle, downvoteStyle } = this.state;
    return (
      <div style={{ textAlign: '-webkit-left', display: 'flex' }}>
        <span href="" style={upvoteType === 'like-o' ? upvoteStyle : { color: 'lightgreen' }}>
          <Icon
            onMouseEnter={this.toggleUpvoteColor}
            onMouseLeave={this.toggleUpvoteColor}
            type={upvoteType}
            style={{ fontSize: 'x-large' }}
            onClick={token ? onUpvote : mustLogin}
          />
        </span>
        {children}
        <span style={downvoteType === 'dislike-o' ? downvoteStyle : { color: 'lightblue' }}>
          <Icon
            onMouseEnter={this.toggleDownvoteColor}
            onMouseLeave={this.toggleDownvoteColor}
            type={downvoteType}
            style={{ fontSize: 'x-large' }}
            onClick={token ? onDownvote : mustLogin}
          />
        </span>
      </div>
    );
  }
}

VoteComponent.propTypes = {
  token: PropTypes.string,
  upvoteType: PropTypes.string.isRequired,
  downvoteType: PropTypes.string.isRequired,
  onUpvote: PropTypes.func.isRequired,
  onDownvote: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

VoteComponent.defaultProps = {
  token: '',
};
