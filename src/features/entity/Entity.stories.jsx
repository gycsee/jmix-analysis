import React from 'react';

import EntityListComponent from './EntityList';

export default {
  title: 'Jmix/Entity',
  component: EntityListComponent,
};

const Template = (args) => <EntityListComponent {...args} />;

export const EntityList = Template.bind({});
