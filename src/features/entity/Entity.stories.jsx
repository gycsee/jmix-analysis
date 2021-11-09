import React from 'react';

import EntityList from './EntityList';

export default {
  title: 'App/Entity',
  component: EntityList,
};

const Template = (args) => <EntityList {...args} />;

export const List = Template.bind({});
