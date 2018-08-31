import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

const HoverModal = (props) => {
  const {
    title,
    visible,
    onOk,
    onCancel,
    loginMessage,
  } = props;
  return (
    <Modal
      title={title}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <p>
        {loginMessage}
      </p>
    </Modal>);
};

export default HoverModal;


HoverModal.propTypes = {
  title: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loginMessage: PropTypes.string.isRequired,
};
