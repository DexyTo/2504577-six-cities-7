import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import { AuthorizationStatus, type AuthUser } from '../const';
import { setAuthorization } from './action';
import { checkAuth, login, logout } from './api-action';

type UserState = {
  authorizationStatus: AuthorizationStatus;
  profile: AuthUser | null;
  hasAuthCheckError: boolean;
  isAuthRequestPending: boolean;
};

const initialState: UserState = {
  authorizationStatus: AuthorizationStatus.Unknown,
  profile: null,
  hasAuthCheckError: false,
  isAuthRequestPending: false,
};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setAuthorization, (state, action) => {
      state.profile = action.payload;
      state.authorizationStatus = action.payload
        ? AuthorizationStatus.Auth
        : AuthorizationStatus.NoAuth;
      state.hasAuthCheckError = false;
    })
    .addCase(checkAuth.rejected, (state) => {
      state.profile = null;
      state.authorizationStatus = AuthorizationStatus.NoAuth;
      state.hasAuthCheckError = true;
    })
    .addMatcher(isAnyOf(login.pending, logout.pending), (state) => {
      state.isAuthRequestPending = true;
    })
    .addMatcher(
      isAnyOf(
        login.fulfilled,
        login.rejected,
        logout.fulfilled,
        logout.rejected,
      ),
      (state) => {
        state.isAuthRequestPending = false;
      },
    );
});
