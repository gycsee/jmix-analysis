import React from 'react';
import { Form, Button, Input, message } from 'antd';
import { useDispatch } from 'react-redux';

import { setCredentials } from './authSlice';
import { useLoginMutation } from '../../app/services/jmix';

export default function LoginIn() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [login, { isLoading, error }] = useLoginMutation();

  const onFinish = async ({ tenant, name, password }) => {
    try {
      const user = await login({
        name,
        password,
        tenant,
      }).unwrap();
      dispatch(setCredentials(user));
    } catch (err) {
      message.error(
        `${error?.status || 'Status'}: ${
          error?.data?.details || error?.data?.error || 'Unknown error'
        }`
      );
    }
  };

  return (
    <Form
      form={form}
      initialValues={{
        tenant: '',
        name: '',
        password: '',
      }}
      onFinish={onFinish}
    >
      <Form.Item label="租户" name="tenant">
        <Input placeholder="租户" />
      </Form.Item>
      <Form.Item label="用户名" name="name" required>
        <Input placeholder="用户名" />
      </Form.Item>
      <Form.Item label="密码" name="password" required>
        <Input.Password placeholder="密码" />
      </Form.Item>
      <Form.Item>
        <Button loading={isLoading} type="primary" htmlType="submit">
          登录
        </Button>
      </Form.Item>
    </Form>
  );
}
