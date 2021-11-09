const name = process.env.STORYBOOK_JMIX_NAME || '';
const basePackage = process.env.STORYBOOK_JMIX_BASE_PACKAGE || '';
const apiUrl = process.env.STORYBOOK_JMIX_API_URL || '';
const restClientId = process.env.STORYBOOK_JMIX_REST_CLIENT_ID || '';
const restClientSecret = process.env.STORYBOOK_JMIX_REST_CLIENT_SECRET || '';

const config = {
  name,
  basePackage,
  apiUrl,
  restClientId,
  restClientSecret,
  storage: localStorage,
};

export default config;
