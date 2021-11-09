import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('__token__') || null,
    locale: 'zh',
  },
  reducers: {
    setCredentials: (state, { payload: { access_token } }) => {
      localStorage.setItem('__token__', access_token);
      state.token = access_token;
    },
    clearCredentials: (state) => {
      localStorage.removeItem('__token__');
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, clearCredentials } = slice.actions;

export default slice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
