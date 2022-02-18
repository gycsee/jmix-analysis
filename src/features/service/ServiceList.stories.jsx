import React from 'react';

import ServiceList from './ServiceList';

export default {
  title: 'App/Service List',
  component: ServiceList,
  argTypes: {
    collapsed: { control: { type: 'number', step: 1 } },
    displayDataTypes: { control: { type: 'boolean' } },
    displayObjectSize: { control: { type: 'boolean' } },
    collapseStringsAfterLength: { control: { type: 'number', step: 1 } },
    groupArraysAfterLength: { control: { type: 'number' } },
    enableClipboard: { control: { type: 'boolean' } },
    displayArrayKey: { control: { type: 'boolean' } },
  }
};

const Template = (args) => <ServiceList {...args} />;

export const List = Template.bind({});
