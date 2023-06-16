import React, { useState, useEffect, forwardRef } from 'react'
import { Button, Typography, Row, Col, Space, Popover, Tag, message, } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

const { Text } = Typography;

function Entity(props) {
  const { entity, findEntity, findEntityMessage, findEnum } = props
  const [ internalEntity, setInternalEntity ] = useState({ properties: [] })
  
  useEffect(() => {
    setInternalEntity({ ...entity })
  }, [entity])

  const handleClose = ({ name }) => {
    setInternalEntity(oldEntity => {
      const newEntity = { ...oldEntity }

      const targetProperty = newEntity.properties.find(property => property.name === name)

      targetProperty.content = null
      targetProperty.visible = false
      
      return newEntity
    })
  }

  const findTargetType = ({
    type,
    name,
    isEnum,
    isComposition
  }) => {
    let content = null
    if(isEnum) {
      const targetEnum = findEnum(type)
      if(!targetEnum) {
        message.warn(`Cannot find enum: ${type}`)
        return
      }

      content = {
        header: <>
          <Text>{targetEnum.enumName}</Text>
          <Text type='secondary'>{targetEnum.name}</Text>
        </>,
        body: <Row gutter={[8]} style={{ display: 'inline-flex', flexDirection: 'column' }}>
          {targetEnum.values?.map((item) => {
            return (
              <Col span={24} key={item?.id}>
                <Space>
                  <Text>{item?.name}</Text>
                  <Text mark>{item?.label}</Text>
                  <Text mark>{item?.id}</Text>
                </Space>
              </Col>
            );
          })}
        </Row>
      }
    }else {
      const targetEntity = findEntity(type)
      if(!targetEntity) {
        message.warn(`Cannot find entity: ${type}`)
        return
      }

      content = {
        header: <>
          {
            isComposition
              ? <Text>List&lt;{findEntityMessage(type)}&gt;</Text>
              : <Text>{findEntityMessage(type)}</Text>
          }
          <Text type='secondary' copyable>{type}</Text>
        </>,
        body: <Entity 
          entity={{ 
            ...targetEntity, 
            properties: [
              ...targetEntity.properties.map(property => ({
                ...property,
                visible: false,
                content: null,
              }))
            ] 
          }} 
          findEntity={findEntity} 
          findEntityMessage={findEntityMessage}
          findEnum={findEnum}
        />
      }
    }

    setInternalEntity(oldEntity => {
      const newEntity = { ...oldEntity }
      const targetProperty = newEntity.properties.find(property => property.name === name)

      targetProperty.visible = true
      targetProperty.content = content

      return newEntity
    })
  }

  return <Row gutter={[8, 4]} style={{ display: 'inline-flex', flexDirection: 'column' }}>
    {internalEntity.properties.map(
      ({
        name,
        type,
        attributeType,
        mandatory,
        readOnly,
        isEnum,
        isAssociation,
        isComposition,
        visible = false,
        content = null,
      }) => {
        return (
          <Col span={24} key={name}>
            <Space>
              <Text>{name}</Text>
              <Text mark>{type}</Text>
              {
                (isEnum || isAssociation || isComposition)
                  ? <Popover 
                    visible={visible} 
                    content={!content 
                      ? null 
                      : <div style={{
                        border: '1px solid #d9d9d9',
                      }}>
                        <Row justify='space-between' style={{
                          borderBottom: '1px solid #d9d9d9',
                          padding: '12px 16px',
                          marginBottom: 8,
                          backgroundColor: '#fafafa'
                        }}>
                          <Space style={{ marginRight: 16 }}>
                            { content?.header }
                          </Space>
                          <Button type='link' size="small" icon={<CloseOutlined />} onClick={() => handleClose({ name })}/>
                        </Row>
                        <div style={{ padding: 16 }}>
                          { content?.body }
                        </div>
                      </div>
                    } 
                    placement='right'
                  >
                    <Button 
                      type='link' 
                      size="small"
                      style={{ padding: 0 }} 
                      onClick={() => findTargetType({ 
                        type,
                        name,
                        isEnum,
                        isAssociation,
                        isComposition
                      })}
                    >
                      {attributeType}
                    </Button>
                  </Popover>
                  : <Text type="success">{attributeType}</Text>
              }
              {mandatory && <Tag size="small" color="processing">必填</Tag>}
              {readOnly && <Tag size="small" color="processing">只读</Tag>}
            </Space>
          </Col>
        );
      }
    )}
  </Row>
}

export default Entity;