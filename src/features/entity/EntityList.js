import React from 'react';
import { Spin, Collapse, Typography, Space, Row, Col, Tag } from 'antd';

import {
  useGetMetadataEntitiesQuery,
  useGetEntitiesMessagesQuery,
} from '../../app/services/jmix';

const { Panel } = Collapse;
const { Text } = Typography;

export default function EntityList() {
  const { data = [], isFetching, isLoading } = useGetMetadataEntitiesQuery();
  const { data: messages = {} } = useGetEntitiesMessagesQuery();

  return (
    <Spin spinning={isLoading}>
      <Collapse defaultActiveKey={[]} expandIcon={null}>
        {data.map(({ entityName, properties }, index) => (
          <Panel
            header={
              <Space>
                <Text>{index + 1}</Text>
                <Text>{messages[entityName]}</Text>
                <Text type="secondary" copyable>
                  {entityName}
                </Text>
              </Space>
            }
            key={entityName}
          >
            <Row gutter={[8, 4]}>
              {properties.map(
                ({
                  name,
                  type,
                  attributeType,
                  mandatory,
                  readOnly,
                }) => {
                  return (
                    <Col span={24} key={name}>
                      <Space>
                        <Text>{name}</Text>
                        <Text mark>{type}</Text>
                        <Text type="success">{attributeType}</Text>
                        {mandatory && <Tag size="small" color="processing">必填</Tag>}
                        {readOnly && <Tag size="small" color="processing">只读</Tag>}
                      </Space>
                    </Col>
                  );
                }
              )}
            </Row>
          </Panel>
        ))}
      </Collapse>
    </Spin>
  );
}
