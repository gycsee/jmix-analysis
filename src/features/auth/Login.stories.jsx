import React from 'react';

import LoginComponent from './Login';

export default {
  title: 'Jmix',
  component: LoginComponent,
};

const Template = (args) => <LoginComponent {...args} />;

export const Login = Template.bind({});
