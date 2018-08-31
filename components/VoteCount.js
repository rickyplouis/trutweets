import React from 'react';
import PropTypes from 'prop-types';

const VoteContainer = ({ isPositve, children }) => (
  <span style={{ marginLeft: '2%', marginRight: '2%', color: isPositve ? 'lightgreen' : 'lightblue' }}>
    {children}
  </span>
);

export default class VoteCount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.displayVoteCount = this.displayVoteCount.bind(this);
  }

  displayVoteCount() {
    const { annotation } = this.props;
    const voteCount = annotation.upvotes.length - annotation.downvotes.length;
    let voteText;
    if (voteCount > 0) {
      voteText = `+${voteCount}`;
    } else if (voteCount === 0) {
      voteText = voteCount;
    } else {
      voteText = voteCount;
    }
    return voteCount && (
      <VoteContainer isPositve={voteCount > 0}>
          {voteText}
      </VoteContainer>);
  }

  render() {
    return (
      <span>
        {this.displayVoteCount()}
      </span>
    );
  }
}

VoteContainer.propTypes = {
  isPositve: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

VoteCount.propTypes = {
  annotation: PropTypes.shape({
    upvotes: PropTypes.array,
    downvotes: PropTypes.array,
  }),
};

VoteCount.defaultProps = {
  annotation: {},
};
