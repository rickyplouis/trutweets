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
import { Container } from '../components/list';

const Styles = {
  signupForm: {
    textAlign: 'center',
    margin: '0 auto',
    marginTop: '5%',
    width: '33%',
  },
};

const PaperController = require('../controllers/paperController');
const Fetch = require('../controllers/fetch');
const config = require('../config');

const { sanitize } = PaperController;

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class NormalLoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonLoading: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.hasError = this.hasError.bind(this);
  }

  componentDidMount() {
    const { form } = this.props;
    // To disabled submit button at the beginning.
    form.validateFields();
  }

  hasError(fieldName) {
    const { form } = this.props;
    const { isFieldTouched, getFieldError } = form;
    return isFieldTouched(fieldName) && getFieldError(fieldName);
  }


  handleSubmit(e) {
    e.preventDefault();

    const { form } = this.props;

    this.setState(prevState => ({
      ...prevState,
      buttonLoading: true,
    }));

    form.validateFields((err, values) => {
      const { email, name, password } = values;
      const sanitizedValues = {
        name: sanitize(name),
        email: sanitize(email),
        password: sanitize(password),
        reputation: 100,
      };
      if (!err) {
        Fetch.postReq('/api/signup', sanitizedValues).then((val) => {
          if (val.success) {
            // navigate to whitepapers
            localStorage.setItem('token', val.token);
            localStorage.setItem('_p_user', val.user);
            localStorage.setItem('secret', config.secret);
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

  render() {
    const { buttonLoading } = this.state;
    const { form } = this.props;
    const {
      getFieldDecorator,
      getFieldsError,
    } = form;

    return (
      <Container activePath={['2']}>
        <div style={Styles.signupForm}>
          <div>
            Signup Form
          </div>
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              validateStatus={this.hasError('email') ? 'error' : ''}
              help={
                this.hasError('email') || ''}
            >
              {getFieldDecorator('email', {
                rules: [{ required: true, message: 'Please input your email!' }],
              })(
                <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />,
              )}
            </FormItem>
            <FormItem
              validateStatus={this.hasError('name') ? 'error' : ''}
              help={this.hasError('name') || ''}
            >
              {getFieldDecorator('name', {
                rules: [{ required: true, message: 'Please input your name!' }],
              })(
                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Name" />,
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
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true,
              })}
              <Button
                style={{ width: '-webkit-fill-available', display: '-webkit-box' }}
                loading={buttonLoading}
                type="primary"
                htmlType="submit"
                className="signup-form-button"
                disabled={hasErrors(getFieldsError())}
              >
                Signup
              </Button>
              Already have an account?
              <a href="/login">
                {' Login'}
              </a>
            </FormItem>
          </Form>
        </div>
      </Container>
    );
  }
}

const SignupForm = Form.create()(NormalLoginForm);

export default SignupForm;

NormalLoginForm.defaultProps = {
  form: {},
};

NormalLoginForm.propTypes = {
  form: PropTypes.shape({
    isFieldTouched: PropTypes.func.isRequired,
    getFieldError: PropTypes.func.isRequired,
  }),
};
