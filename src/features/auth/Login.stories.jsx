import React from 'react';

import Login from './Login';

export default {
  title: 'App/Login',
  component: Login,
};

const Template = (args) => <Login {...args} />;

export const Basic = Template.bind({});
