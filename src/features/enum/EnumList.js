import React, { useMemo } from 'react';
import { Spin, Collapse, Typography, Space, Row, Col, message } from 'antd';
import ReactJson from 'react-json-view';

import { useGetEnumsQuery, useGetMessagesEnumsQuery } from '../../app/services/jmix';
import config from "../../app/services/config";

const { Panel } = Collapse;
const { Text } = Typography;
const scope = `${config.basePackage}.`;

export default function EnumList() {
  const { data = [], isFetching, isLoading, error } = useGetEnumsQuery();
  const { data: messages = {} } = useGetMessagesEnumsQuery();

  const enums = useMemo(() => {
    if (data?.length > 0) {
      console.log(data.filter(({ id, name, values }) => {
        for (let i = 0; i < values.length; i++) {
          const element = values[i];
          if (element.id !== element.name) {
            return true;
          }
        }
        return false;
      }));
      console.log('extra enums', data.filter(({ id, name, values }) => {
        for (let i = 0; i < values.length; i++) {
          const element = values[i];
          if (element.extra) {
            return true;
          }
        }
        return false;
      }));
      console.log('国际化异常Enums', data.filter(({ id, name, values }) => {
        const enumLastName = name?.split('.')?.pop();
        for (let i = 0; i < values.length; i++) {
          const element = values[i];
          const m = messages[`${name}.${element?.name}`];
          // const regex = new RegExp(/[A-Za-z]+\.[A-Za-z]+/);
          if (m?.startsWith(`${enumLastName}.`)) {
            return true;
          }
        }
        return false;
      }).map(({ name, values }) => {
        return {
          name,
          m: messages[name],
          values: values?.map((item) => {
            const m = messages[`${name}.${item?.name}`];
            return {
              name: item?.name,
              m: m,
              id: item?.id,
            };
          }),
        };
      }));
      return data
        .filter((item) => item?.name?.startsWith(scope))
        .map((item) => ({
          ...item,
          enumName: item?.name?.replace(scope, ''),
        }))
        .sort((a, b) => a?.entityName?.localeCompare(b?.enumName));
    }
    return [];
  }, [data, messages])

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
      <Collapse defaultActiveKey={[]} expandIcon={null}>
        <Panel header="原始数据" key="all">
          <ReactJson
            src={data}
            collapsed={2}
            displayDataTypes={false}
          />
        </Panel>
        {enums.map(({ id, name, enumName, values }, index) => (
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
                      <Text mark>{item?.id}</Text>
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
