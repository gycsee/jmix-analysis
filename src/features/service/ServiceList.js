import React from 'react';
import {
  Collapse,
  Typography,
  Space,
  Form,
  Button,
  Input,
  message,
} from 'antd';
import ReactJson from 'react-json-view';

import { useLoadServiceMutation } from '../../app/services/jmix';

const { Panel } = Collapse;
const { Text } = Typography;

export default function LoginIn() {
  const [serviceMap, setServiceMap] = React.useState(new Map());
  const [form] = Form.useForm();
  const [loadservice, { isLoading }] = useLoadServiceMutation();

  const onFinish = async (values) => {
    try {
      const data = await loadservice(values.serviceName).unwrap();
      setServiceMap(new Map(serviceMap.set(data?.name, data?.methods)));
    } catch (err) {
      message.error(err.message);
    }
  };

  return (
    <div>
      <Form
        form={form}
        initialValues={{
          serviceName: '',
        }}
        onFinish={onFinish}
      >
        <Form.Item
          required
          label="Service Name"
          name="serviceName"
          rules={[{ required: true }]}
        >
          <Input placeholder="Service Name" />
        </Form.Item>
        <Form.Item>
          <Button loading={isLoading} type="primary" htmlType="submit">
            查询
          </Button>
        </Form.Item>
      </Form>

      <Collapse defaultActiveKey={[]} expandIcon={null}>
        {Array.from(serviceMap).map(([serviceName, methods]) => (
          <Panel
            header={
              <Space>
                <Text>{serviceName}</Text>
              </Space>
            }
            key={serviceName}
          >
            <ReactJson src={methods} collapsed={2} displayDataTypes={false} />
          </Panel>
        ))}
      </Collapse>
    </div>
  );
}
