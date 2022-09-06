import React from 'react';

import ServiceListComponent from './ServiceList';

export default {
  title: 'Jmix/Service',
  component: ServiceListComponent,
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

const Template = (args) => <ServiceListComponent {...args} />;

export const ServiceList = Template.bind({});
