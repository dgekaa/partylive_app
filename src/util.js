import {AsyncStorage} from 'react-native';

const USER_DATA = 'user';
let user;

export const getUser = async () => {
  if (user) return Promise.resolve(user);

  user = await AsyncStorage.getItem(USER_DATA);
  return user;
};

export const setUser = (newUser) => {
  user = newUser;
  return AsyncStorage.setItem(USER_DATA, user);
};

export const deleteUser = () => {
  user = undefined;
  return AsyncStorage.removeItem(USER_DATA);
};

const AUTH_TOKEN = 'token';
let token;

export const getToken = async () => {
  if (token) return Promise.resolve(token);

  token = await AsyncStorage.getItem(AUTH_TOKEN);
  return token;
};

export const signIn = (newToken) => {
  token = newToken;
  return AsyncStorage.setItem(AUTH_TOKEN, newToken);
};

export const signOut = () => {
  token = undefined;
  return AsyncStorage.removeItem(AUTH_TOKEN);
};
