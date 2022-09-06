import React from 'react';

import FetchPlanViewer from './FetchPlanViewer';

export default {
  title: 'Jmix/Entity',
  component: FetchPlanViewer,
  argTypes: {
    entityName: { control: { type: "text" } },
  },
  args: {
    entityName: ''
  }
};

const Template = (args) => <FetchPlanViewer {...args} />;

export const EntityFetchPlan = Template.bind({});
