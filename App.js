import React, {useState, useEffect} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';

import Map from './src/screens/Map';
import Home from './src/screens/Home';
import Company from './src/screens/Company';
import Login from './src/screens/Login';
import Registration from './src/screens/Registration';
import EditCompany from './src/screens/EditCompany';
import Admin from './src/screens/Admin';

import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import {ApolloProvider} from 'react-apollo';
import {setContext} from 'apollo-link-context';

import {getToken, signIn, signOut} from './src/util';

import Header from './src/components/Header';

const httpLink = new HttpLink({
  uri: 'http://194.87.95.37/graphql',
});

const authLink = setContext(async (req, {headers}) => {
  const token = await getToken();
  return {
    ...headers,
    headers: {
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

const link = authLink.concat(httpLink);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link,
});

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const StackRoutes = () => (
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen
      name="Home"
      component={Home}
      options={{
        title: 'Главная',
        header: (props) => <Header props={props} />,
      }}
    />
    <Stack.Screen
      name="Map"
      component={Map}
      options={{
        // title: 'Карта',
        header: (props) => <Header props={props} />,
      }}
    />
    <Stack.Screen
      name="Company"
      component={Company}
      options={{
        header: (props) => <Header props={props} />,
      }}
    />
    <Stack.Screen
      name="Login"
      component={Login}
      options={{
        // title: 'Login',
        header: (props) => <Header props={props} />,
      }}
    />
    <Stack.Screen
      name="Registration"
      component={Registration}
      options={{
        // title: 'Registration',
        header: (props) => <Header props={props} />,
      }}
    />
    <Stack.Screen
      name="Admin"
      component={Admin}
      options={{
        // title: 'Admin',
        header: (props) => <Header props={props} />,
      }}
    />
    <Stack.Screen
      name="EditCompany"
      component={EditCompany}
      options={{
        // title: 'EditCompany',
        header: (props) => <Header props={props} />,
      }}
    />
  </Stack.Navigator>
);

const CustomBtn = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      {props.loggedIn && (
        <DrawerItem
          label="Выход"
          labelStyle={{color: 'red'}}
          onPress={() => {
            props.changeLoginState(false);
            props.navigation.navigate('Home');
          }}
        />
      )}
    </DrawerContentScrollView>
  );
};

const App = () => {
  const [loggedIn, setLoggedIn] = useState();

  const getAsyncToken = async () => {
    const token = await getToken();
    if (token) {
      setLoggedIn(true);
    }
  };

  useEffect(() => {
    getAsyncToken();
  }, []);

  const handleChangeLoginState = (loggedIn = false, token) => {
    setLoggedIn(loggedIn);
    if (loggedIn) {
      signIn(token);
    } else {
      signOut();
    }
  };

  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Drawer.Navigator
          edgeWidth={50}
          drawerPosition="right"
          mode="modal"
          headerMode="screen"
          initialRouteName="Home"
          drawerType="slide"
          drawerStyle={{
            backgroundColor: '#fff',
            width: 240,
          }}
          drawerContent={(props) => (
            <CustomBtn
              {...props}
              loggedIn={loggedIn}
              changeLoginState={handleChangeLoginState}
            />
          )}>
          <Drawer.Screen name="Главная" component={StackRoutes} />
          {/* <Drawer.Screen name="Карта" component={Map} /> */}
          {!loggedIn && (
            <Drawer.Screen
              name="Вход"
              component={(props) => (
                <Login {...props} changeLoginState={handleChangeLoginState} />
              )}
            />
          )}
          {!loggedIn && (
            <Drawer.Screen
              name="Регистрация"
              component={(props) => (
                <Registration
                  {...props}
                  changeLoginState={handleChangeLoginState}
                />
              )}
            />
          )}
          {loggedIn && (
            <Drawer.Screen name="Список заведений" component={EditCompany} />
          )}
        </Drawer.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
};

export default App;
