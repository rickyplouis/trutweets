/* eslint-env browser */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Icon,
  Input,
  Button,
} from 'antd';
import Router from 'next/router';
import { Container, HoverModal } from '../components/list';

const createDOMPurify = require('dompurify');

const Styles = {
  loginForm: {
    textAlign: 'center',
    margin: '0 auto',
    marginTop: '5%',
    width: '33%',
  },
};

const Fetch = require('../controllers/fetch');
const config = require('../config');

const FormItem = Form.Item;

const sanitize = input => createDOMPurify.sanitize(input);


function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class HorizontalLoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonLoading: false,
      visible: false,
      loginMessage: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentDidMount() {
    const { form } = this.props;
    // To disabled submit button at the beginning.
    form.validateFields();
  }

  handleSubmit(evt) {
    const { form } = this.props;
    evt.preventDefault();

    this.setState(prevState => ({
      ...prevState,
      buttonLoading: true,
    }));
    form.validateFields((err, values) => {
      const { email, password } = values;
      const sanitizedValues = {
        email: sanitize(email),
        password: sanitize(password),
      };
      if (!err) {
        Fetch.postReq('/api/authenticate', sanitizedValues).then((val) => {
          if (val.success) {
            // navigate to whitepapers
            localStorage.setItem('secret', config.secret);
            localStorage.setItem('token', val.token);
            localStorage.setItem('_p_user', val.user);
            Router.push('/');
          } else {
            this.setState(prevState => ({
              ...prevState,
              loginMessage: val.message,
            }));
            this.showModal();
          }
          this.setState(prevState => ({
            ...prevState,
            buttonLoading: false,
          }));
        });
      }
    });
  }

  showModal() {
    this.setState({
      visible: true,
    });
  }

  handleOk(evt) {
    evt.preventDefault();
    this.setState({
      visible: false,
    });
  }


  handleCancel(evt) {
    evt.preventDefault();
    this.setState({
      visible: false,
    });
  }

  hasError(fieldName) {
    const { form } = this.props;
    const { isFieldTouched, getFieldError } = form;
    return isFieldTouched(fieldName) && getFieldError(fieldName);
  }


  render() {
    const { form } = this.props;
    const {
      getFieldDecorator,
      getFieldsError,
    } = form;

    const {
      visible,
      loginMessage,
      buttonLoading,
    } = this.state;

    return (
      <Container activePath={['3']}>
        <div style={Styles.loginForm}>
          <div>
            Login
          </div>
          <HoverModal
            title="Login Failed"
            visible={visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            loginMessage={loginMessage}
          />
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              validateStatus={this.hasError('email') ? 'error' : ''}
              help={this.hasError('email') || ''}
            >
              {getFieldDecorator('email', {
                rules: [{ required: true, message: 'Please input your email!' }],
              })(
                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />,
              )}
            </FormItem>
            <FormItem
              validateStatus={this.hasError('password') ? 'error' : ''}
              help={this.hasError('password') || ''}
            >
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input your Password!' }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />,
              )}
            </FormItem>
            <FormItem>
              <Button
                loading={buttonLoading}
                type="primary"
                htmlType="submit"
                disabled={hasErrors(getFieldsError())}
              >
                Login
              </Button>
              <span style={{ display: '-webkit-box', textAlign: '-webkit-center' }}>
                Don&apos;t have an account?
                <a href="/signup">
                  {' Signup'}
                </a>
              </span>
            </FormItem>
          </Form>
        </div>
      </Container>
    );
  }
}

const WrappedHorizontalLoginForm = Form.create()(HorizontalLoginForm);

export default WrappedHorizontalLoginForm;


HorizontalLoginForm.propTypes = {
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldsError: PropTypes.func.isRequired,
    isFieldTouched: PropTypes.func.isRequired,
    getFieldError: PropTypes.func.isRequired,
  }),
};

HorizontalLoginForm.defaultProps = {
  form: {},
};
