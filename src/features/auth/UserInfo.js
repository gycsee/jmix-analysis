import React from 'react';
import { Spin } from 'antd';

import {
  useGetUserInfoQuery,
} from '../../app/services/jmix';

export default function UserInfo() {
  const { data = {}, isFetching, isLoading } = useGetUserInfoQuery();

  return (
    <Spin spinning={isLoading}>
      Your info: {JSON.stringify(data)}
    </Spin>
  );
}
