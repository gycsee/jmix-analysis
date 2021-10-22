import React from 'react';

import { Counter } from './Counter';

export default {
  title: 'Redux/Counter',
  component: Counter,
};

const Template = (args) => <Counter {...args} />;

export const Basic = Template.bind({});
