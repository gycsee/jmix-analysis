import React from 'react';
import PropTypes from 'prop-types';
import { Spin, message } from 'antd';
import ReactJson from 'react-json-view';

import { useLoadServiceQuery } from '../../app/services/jmix';

export default function Service({ serviceName }) {
  const {
    data,
    isUninitialized,
    error,
    isFetching,
  } = useLoadServiceQuery(serviceName, {
    skip: !serviceName,
    refetchOnMountOrArgChange: true,
  });

  React.useEffect(() => {
    if (error) {
      message.error(
        `${error?.status || 'Status'}: ${
          error?.data?.details || error?.data?.error || 'Unknown error'
        }`
      );
    }
  }, [error]);

  if (isUninitialized) {
    return '请输入您需要查看的 service name';
  }

  return (
    <div>
      <Spin spinning={isFetching}>
        <ReactJson src={data} collapsed={2} displayDataTypes={false} />
      </Spin>
    </div>
  );
}

Service.propTypes = {
  serviceName: PropTypes.string.isRequired,
};
