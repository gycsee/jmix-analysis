import React from 'react';
import { Spin, message } from 'antd';
import ReactJson from 'react-json-view';

import {
  jmixApi,
} from '../../app/services/jmix';

export default function UserInfo() {
  const { data = {}, isLoading, error } = jmixApi.useGetUserInfoQuery();
  const { data: permissions } = jmixApi.useGetPermissionsQuery(); // 权限信息

  React.useEffect(() => {
    if (error) {
      message.error(
        `${error?.status || 'Status'}: ${
          error?.data?.details || error?.data?.error || 'Unknown error'
        }`
      );
    }
  }, [error]);

  return (
    <Spin spinning={isLoading}>
      Your info
      <ReactJson src={data} collapsed={2} displayDataTypes={false} />
    </Spin>
  );
}
