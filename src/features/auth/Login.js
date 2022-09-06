import React from 'react';
import { Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { clearCredentials } from './authSlice';
import { useRevokeTokenMutation } from '../../app/services/jmix';
import LoginIn from './LoginIn';
import UserInfo from './UserInfo';

export default function Login() {
  const dispatch = useDispatch();
  const [revokeToken, { isLoading, error }] = useRevokeTokenMutation();
  const { token } = useSelector((state) => state.auth);

  const onClick = async () => {
    try {
      const result = await revokeToken(token).unwrap();
      console.log(result);
      dispatch(clearCredentials());
    } catch (err) {
      message.error(err.message);
      dispatch(clearCredentials()); // TODO need error handler
    }
  };

  React.useEffect(() => {
    if (error) {
      message.error(
        `${error?.status || 'Status'}: ${
          error?.data?.details || error?.data?.error || 'Unknown error'
        }`
      );
    }
  }, [error]);

  if (!token) {
    return <LoginIn />;
  }

  return (
    <div>
      <UserInfo />
      <Button loading={isLoading} type="primary" onClick={onClick}>
        退出
      </Button>
    </div>
  );
}
