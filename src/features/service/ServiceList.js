import React from 'react';
import PropTypes from 'prop-types';
import { message, Spin } from 'antd';
import ReactJson from 'react-json-view';

import { useLoadServicesQuery } from '../../app/services/jmix';

export default function ServiceList({
  collapsed = 2,
  displayDataTypes = false,
}) {
  const { data, isUninitialized, error, isFetching } = useLoadServicesQuery(
    null,
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );

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
    return '请输入您需要查看的 service';
  }

  return (
    <div>
      <Spin spinning={isFetching}>
        <ReactJson
          src={data}
          collapsed={collapsed}
          displayDataTypes={displayDataTypes}
        />
      </Spin>
    </div>
  );
}

ServiceList.propTypes = {
  /**
   * 折叠深度
   */
  collapsed: PropTypes.number,
  /**
   * 展示数据类型
   */
  displayDataTypes: PropTypes.bool,
  /**
   * 展示数组长度
   */
  displayObjectSize: PropTypes.bool,
  /**
   * 字符串超过多长时显示显示省略号
   */
  collapseStringsAfterLength: PropTypes.number,
  /**
   * 数组过长时隐藏
   */
  groupArraysAfterLength: PropTypes.number,
  /**
   * 允许复制
   */
  enableClipboard: PropTypes.bool,
  /**
   * 显示数组 key
   */
  displayArrayKey: PropTypes.bool,
};

ServiceList.defaultProps = {
  collapsed: 2,
  displayDataTypes: false,
  displayObjectSize: false,
  collapseStringsAfterLength: false,
  groupArraysAfterLength: 100,
  enableClipboard: false,
  displayArrayKey: false,
};
