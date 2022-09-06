import React from 'react';

import EnumList from './EnumList';

export default {
  title: 'Jmix/Enum',
  component: EnumList,
};

const Template = (args) => <EnumList {...args} />;

export const List = Template.bind({});
