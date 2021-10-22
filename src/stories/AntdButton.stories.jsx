import React from 'react';

import AntdButton from './AntdButton';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Ant Design/Button',
  component: AntdButton,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    type: {
      control: 'radio',
      options: ['primary', 'ghost', 'dashed', 'link', 'text', 'default']
    },
    size: {
      control: 'radio',
      options: ['large', 'middle', 'small']
    }
  },
  args: {
    type: "primary",
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <AntdButton {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  type: "primary",
  label: 'Ant Design',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Ant Design',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Ant Design',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Ant Design',
};
