import React, { useCallback, useRef, useState } from 'react';
import { Spin, Collapse, Typography, Space, message, Form, Input, Button, Checkbox } from 'antd';

import {
  useGetMetadataEntitiesQuery,
  useGetEntitiesMessagesQuery,
  useGetEnumsQuery,
  useGetMessagesEnumsQuery
} from '../../app/services/jmix';
import EntityItem from './EntityItem';
import filter from './filter';

const { Panel } = Collapse;
const { Text } = Typography;

const searchFormInitialValues = {
  keyword: '',
  includeFieldKey: true,
}

export default function EntityList() {
  const [form] = Form.useForm()
  const { data = [], isFetching, isLoading, error } = useGetMetadataEntitiesQuery();
  const { data: messages = {} } = useGetEntitiesMessagesQuery();

  const { 
    data: enums = [], 
    isFetching: isFetchingEnum, 
    isLoading: isFetchEnumLoading, 
    error: fetchEnumError 
  } = useGetEnumsQuery();
  const { data: enumMessages = {} } = useGetMessagesEnumsQuery();

  const [formValues, setFormValues] = useState(searchFormInitialValues)

  React.useEffect(() => {
    if (error) {
      message.error(
        `${error?.status || 'Status'}: ${
          error?.data?.details || error?.data?.error || 'Unknown error'
        }`
      );
    }
  }, [error]);

  const baseEntityList = React.useMemo(() => {
    if(!data) {
      return []
    }

    return data.map(entity => ({
      ...entity,
      properties: entity.properties.map(property => ({
        ...property,
        isEnum: property.attributeType === 'ENUM',
        isComposition: property.attributeType === 'COMPOSITION',
        isAssociation: property.attributeType === 'ASSOCIATION',
      }))
    }))
  }, [data])

  const entityList = React.useMemo(() => {
    return filter(baseEntityList, formValues)
  }, [baseEntityList, formValues])

  const onFinish = (values) => {
    setFormValues(values)
  }  

  const findEntity = useCallback((entityName) => {
    return baseEntityList.find(entity => entity.entityName === entityName)
  }, [entityList])

  const findEnum = useCallback((enumName) => {
    const target = enums.find(enumItem => enumItem.name === enumName)

    return target 
      ? {
        ...target,
        enumName: enumMessages[enumName],
        values: target.values.map(v => ({
          ...v,
          label: enumMessages[`${target.name}.${v.name}`]
        }))
      }
      : null
  }, [enums])

  const findEntityMessage = useCallback((entityName) => {
    return messages[entityName]
  }, [messages])

  return (
    <Spin spinning={isLoading || isFetchEnumLoading}>
      <Form layout='inline' form={form} onFinish={onFinish} style={{ marginBottom: 16 }} initialValues={searchFormInitialValues}>
        <Form.Item name="keyword" label="关键字">
          <Input placeholder='关键字'/>
        </Form.Item>

        <Form.Item name="includeFieldKey" valuePropName='checked'>
          <Checkbox>是否查询属性key</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={() => {
            form.submit()
          }}>搜索</Button>
          <Button type="primary" ghost onClick={() => {
            form.resetFields()
            form.submit()
          }}>重置</Button>
        </Form.Item>
      </Form>

      <Collapse expandIcon={null}>
        {entityList.map((entity, index) => (
          <Panel
            header={
              <Space>
                <Text>{index + 1}</Text>
                <Text>{messages[entity.entityName]}</Text>
                <Text type="secondary" copyable>
                  {entity.entityName}
                </Text>
              </Space>
            }
            key={entity.entityName}
            destroyInactivePanel
          >
            <EntityItem 
              entity={entity} 
              findEntity={findEntity} 
              findEntityMessage={findEntityMessage} 
              findEnum={findEnum}  
            />
          </Panel>
        ))}
      </Collapse>
    </Spin>
  );
}


