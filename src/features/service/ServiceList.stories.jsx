import React from 'react';

import ServiceList from './ServiceList';

export default {
  title: 'App/Service',
  component: ServiceList,
};

const Template = (args) => <ServiceList {...args} />;

export const List = Template.bind({});
