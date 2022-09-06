import React from 'react';
import PropTypes from 'prop-types';
import { Spin, message } from 'antd';
import ReactJson from 'react-json-view';

import { jmixApi } from '../../app/services/jmix';

export default function FetchPlanViewer({ entityName }) {
  const {
    data,
    isUninitialized,
    error,
    isFetching,
  } = jmixApi.useGetFetchPlansQuery(entityName, {
    skip: !entityName,
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
    return '请输入您需要查看 fetch plans 的 entity name';
  }

  return (
    <div>
      <Spin spinning={isFetching}>
        <ReactJson src={data} collapsed={2} displayDataTypes={false} />
      </Spin>
    </div>
  );
}

FetchPlanViewer.propTypes = {
  entityName: PropTypes.string.isRequired,
};
