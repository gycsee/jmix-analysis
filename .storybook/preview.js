import { Provider } from 'react-redux';

import { store } from '../src/app/store';
import App from '../src/App';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    expanded: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [
  (Story) => (
    <Provider store={store}>
      <App>
        <Story />
      </App>
    </Provider>
  ),
];