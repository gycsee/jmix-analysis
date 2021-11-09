import React, { useMemo } from 'react';
import { Spin, Collapse, Typography, Space, Row, Col } from 'antd';

import { useGetEnumsQuery, useGetMessagesEnumsQuery } from '../../app/services/jmix';
import config from "../../app/services/config";

const { Panel } = Collapse;
const { Text } = Typography;
const scope = `${config.basePackage}.entity.dict.`;

export default function EnumList() {
  const { data = [], isFetching, isLoading } = useGetEnumsQuery();
  const { data: messages = {} } = useGetMessagesEnumsQuery();

  const enums = useMemo(() => {
    if (data?.length > 0) {
      return data
        .filter((item) => item?.name?.startsWith(scope))
        .map((item) => ({
          ...item,
          enumName: item?.name?.replace(scope, ''),
        }))
        .sort((a, b) => a?.entityName?.localeCompare(b?.enumName));
    }
    return [];
  }, [data])

  return (
    <Spin spinning={isLoading}>
      <Collapse defaultActiveKey={[]} expandIcon={null}>
        {enums.map(({ name, enumName, values }, index) => (
          <Panel
            header={
              <Space>
                <Text>{index + 1}</Text>
                <Text>{messages[name]}</Text>
                <Text type="secondary" copyable>
                  {name}
                </Text>
              </Space>
            }
            key={name}
          >
            <Row gutter={[8]}>
              {values?.map((item) => {
                return (
                  <Col span={24} key={item?.id}>
                    <Space>
                      <Text>{item?.name}</Text>
                      <Text mark>{messages[`${name}.${item?.name}`]}</Text>
                    </Space>
                  </Col>
                );
              })}
            </Row>
          </Panel>
        ))}
      </Collapse>
    </Spin>
  );
}
