import React from 'react';
import { Select, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { changeLocale } from './authSlice';

export default function LoginIn() {
  const dispatch = useDispatch();
  const locale = useSelector((state) => state.auth.locale);

  const handleChange = (value) => {
    dispatch(changeLocale(value));
  };

  return (
    <Space>
      国际化
      <Select
        placeholder="语种"
        value={locale}
        onChange={handleChange}
        options={[
          { value: 'en', label: '英文' },
          { value: 'zh', label: '中文' },
        ]}
      />
    </Space>
  );
}
