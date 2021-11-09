import { configureStore } from '@reduxjs/toolkit';

import { jmixApi } from './services/jmix';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    [jmixApi.reducerPath]: jmixApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(jmixApi.middleware),
});
