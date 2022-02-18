import React from 'react';

import Service from './Service';

export default {
  title: 'App/Service',
  component: Service,
  argTypes: {
    serviceName: { control: { type: "text" } },
  },
  args: {
    serviceName: ''
  }
};

const Template = (args) => <Service {...args} />;

export const Item = Template.bind({});
