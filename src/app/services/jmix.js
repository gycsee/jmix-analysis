import { createApi } from '@reduxjs/toolkit/query/react';

import baseQuery from './baseQuery';
import { getBasicAuthHeaders } from './utils'
import config from './config'

export const jmixApi = createApi({
  reducerPath: 'jmixApi',
  baseQuery,
  tagTypes: ['User', 'Entity', 'Service', 'Enum', 'Message'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (user) => {
        const headers = getBasicAuthHeaders(
          config.restClientId,
          config.restClientSecret,
          'zh'
        );
        if (user?.tenant) {
          headers['x-tenant-code'] = user?.tenant;
        }
        return {
          url: `oauth/token`,
          method: 'POST',
          headers,
          body: `grant_type=password&username=${encodeURIComponent(
            user?.name
          )}&password=${encodeURIComponent(user?.password)}`,
        };
      },
    }),
    revokeToken: builder.mutation({
      query: (token) => {
        const headers = getBasicAuthHeaders(
          config.restClientId,
          config.restClientSecret,
          'zh'
        );
        return {
          url: `oauth/revoke`,
          method: 'POST',
          headers,
          body: `token=${encodeURIComponent(token)}`,
        }
      },
    }),
    getMetadataEntities: builder.query({
      query: () => `metadata/entities`,
      transformResponse: (response) => {
        return response.sort((a, b) =>
          a?.entityName?.localeCompare(b?.entityName)
        );
      },
    }),
    getMetadataEntity: builder.query({
      query: (entityName) => `metadata/entities/${entityName}`,
    }),
    getEntityView: builder.query({
      query: (entityName) => `metadata/entities/${entityName}/views`,
    }),
    getEntitiesMessages: builder.query({
      query: () => 'messages/entities',
    }),
    getEnums: builder.query({
      query: () => 'metadata/enums',
    }),
    getMessagesEnums: builder.query({
      query: () => 'messages/enums',
    }),
    getUserInfo: builder.query({
      query: () => 'api/userInfo',
    }),
  }),
});

export const {
  useLoginMutation,
  useRevokeTokenMutation,
  useGetMetadataEntitiesQuery,
  useGetMetadataEntityQuery,
  useGetEntityViewQuery,
  useGetEntitiesMessagesQuery,
  useGetEnumsQuery,
  useGetMessagesEnumsQuery,
  useGetUserInfoQuery,
} = jmixApi;
