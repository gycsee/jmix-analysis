import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query';

import config from './config';
import {
  setCredentials,
  clearCredentials,
} from '../../features/auth/authSlice';
import { getBasicAuthHeaders } from './utils'

const baseUrl = config.apiUrl;

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    const locale = getState().auth.locale;

    headers.set(
      'content-type',
      'application/x-www-form-urlencoded; charset=UTF-8'
    );
    headers.set('accept-language', locale || 'zh');
    if (token && !headers.has('authorization')) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

/**
 * 授权接口 url 需要加上 `rest/` 前缀
 * @param {*} args 
 * @param {*} api 
 * @param {*} extraOptions 
 * @returns 
 */
const dynamicBaseQuery = async (args, api, extraOptions) => {
  const token = api.getState().auth.token;
  if (!token) {
    return baseQuery(args, api, extraOptions)
  }
  const urlEnd = typeof args === 'string' ? args : args.url
  const adjustedUrl = `rest/${urlEnd}`
  const adjustedArgs =
    typeof args === 'string' ? adjustedUrl : { ...args, url: adjustedUrl }
  return baseQuery(adjustedArgs, api, extraOptions)
}

/**
 * status 401 自动重新授权
 * @param {*} args 
 * @param {*} api 
 * @param {*} extraOptions 
 * @returns 
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await dynamicBaseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshToken = api.getState().auth.refresh_token;
    const locale = api.getState().auth.locale;
    const tenant = api.getState().auth.tenant;
    if (refreshToken) {
      const headers = getBasicAuthHeaders(
        config.restClientId,
        config.restClientSecret,
        locale
      );
      if (tenant) {
        headers['x-tenant-code'] = tenant;
      }
      const refreshArgs =  {
        url: `oauth/token`,
        method: 'POST',
        headers,
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      };
      
      const refreshResult = await dynamicBaseQuery(refreshArgs, api, extraOptions);
      if (refreshResult) {
        // store the new token
        api.dispatch(setCredentials(refreshResult));
        // retry the initial query
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearCredentials());
      }
    } else {
      api.dispatch(clearCredentials());
    }
  }
  return result;
};

/**
 * 自动重试
 */
const staggeredBaseQueryWithBailOut = retry(
  async (args, api, extraOptions) => {
    const result = await fetchBaseQuery({ baseUrl })(args, api, extraOptions);

    // bail out of re-tries immediately if unauthorized,
    // because we know successive re-retries would be redundant
    if (result.error?.status === 401) {
      retry.fail(result.error);
    }

    return result;
  },
  {
    maxRetries: 5,
  }
);

export default baseQueryWithReauth;
