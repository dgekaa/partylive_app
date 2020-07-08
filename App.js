import React, {useState, useEffect} from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  View,
  SafeAreaView,
} from 'react-native';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import {ApolloProvider} from 'react-apollo';
import {setContext} from 'apollo-link-context';
import {List, ListItem} from 'native-base';
import {createDrawerNavigator} from 'react-navigation-drawer';

import Map from './src/screens/Map';
import Home from './src/screens/Home';
import Company from './src/screens/Company';
import Login from './src/screens/Login';
import Registration from './src/screens/Registration';
import EditCompany from './src/screens/EditCompany';
import Admin from './src/screens/Admin';
import {getToken, signIn, signOut} from './src/util';

const httpLink = new HttpLink({
  uri: 'https://backend.partylive.by/graphql',
});

const authLink = setContext(async (req, {headers}) => {
  const token = await getToken();
  return {
    ...headers,
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
});

const link = authLink.concat(httpLink);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link,
});

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

  const navOptionHandler = (navigation) => ({
    header: null,
  });

  // НИЖНЕЕ МЕНЮ
  const HomeStackNavigator = createStackNavigator({
    Home: {
      screen: Home,
      navigationOptions: navOptionHandler,
    },
  });
  const MapStackNavigator = createStackNavigator({
    Map: {
      screen: Map,
      navigationOptions: navOptionHandler,
    },
  });
  const MainTab = createBottomTabNavigator(
    {
      Home: {
        screen: HomeStackNavigator,
        navigationOptions: {
          tabBarIcon: ({focused}) => (
            <View style={styles.bottomTabBlock}>
              <Image
                width={26}
                height={26}
                source={require('./src/img/menu2.png')}
              />
              <Text style={[styles.bottomTabText, focused && styles.focused]}>
                Главная
              </Text>
            </View>
          ),
          tabBarLabel: () => {},
        },
      },
      Map: {
        screen: MapStackNavigator,
        navigationOptions: {
          tabBarIcon: ({focused}) => (
            <View style={styles.bottomTabBlock}>
              <Image
                width={26}
                height={26}
                source={require('./src/img/location1.png')}
              />
              <Text style={[styles.bottomTabText, focused && styles.focused]}>
                Карта
              </Text>
            </View>
          ),
          tabBarLabel: () => {},
        },
      },
    },
    {
      tabBarOptions: {
        style: {
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          paddingBottom: 15,
          borderTopColor: '#ededed',
        },
      },
    },
  );

  const MainStack = createStackNavigator(
    {
      Home: {
        screen: MainTab,
        navigationOptions: navOptionHandler,
      },
      EditCompany: {
        screen: EditCompany,
        navigationOptions: navOptionHandler,
      },
      Login: {
        screen: Login,
        navigationOptions: navOptionHandler,
      },
      Registration: {
        screen: Registration,
        navigationOptions: navOptionHandler,
      },
      Admin: {
        screen: Admin,
        navigationOptions: navOptionHandler,
      },
      Company: {
        screen: Company,
        navigationOptions: navOptionHandler,
      },
    },
    {initialRouteKey: 'Home'},
  );

  // БОКОВОЕ МЕНЮ
  const SideMenu = (props) => {
    return (
      <ScrollView>
        <SafeAreaView>
          <List>
            <ListItem onPress={() => props.navigation.navigate('Home')}>
              <Text>Список</Text>
            </ListItem>
            <ListItem onPress={() => props.navigation.navigate('Map')}>
              <Text>Карта</Text>
            </ListItem>
            {props.loggedIn && (
              <ListItem
                onPress={() => props.navigation.navigate('EditCompany')}>
                <Text>Список заведений</Text>
              </ListItem>
            )}
            {!props.loggedIn && (
              <ListItem
                onPress={() =>
                  props.navigation.navigate('Login', {
                    changeLoginState: props.changeLoginState,
                  })
                }>
                <Text>Вход</Text>
              </ListItem>
            )}
            {!props.loggedIn && (
              <ListItem
                onPress={() =>
                  props.navigation.navigate('Registration', {
                    changeLoginState: props.changeLoginState,
                  })
                }>
                <Text>Регистрация</Text>
              </ListItem>
            )}
          </List>
          {props.loggedIn && (
            <List style={styles.logoutBtn}>
              <ListItem
                noBorder
                onPress={() => {
                  props.changeLoginState(false);
                  props.navigation.navigate('Home');
                }}>
                <Text style={styles.logoutBtnText}>Выход</Text>
              </ListItem>
            </List>
          )}
        </SafeAreaView>
      </ScrollView>
    );
  };
  const AppDrawer = createDrawerNavigator(
    {
      drawer: MainStack,
    },
    {
      contentComponent: (props) => {
        return (
          <SideMenu
            {...props}
            loggedIn={loggedIn}
            changeLoginState={handleChangeLoginState}
          />
        );
      },
      animationEnabled: true,
      swipeEnabled: true,
      drawerWidth: (Dimensions.get('window').width * 3) / 4,
      drawerPosition: 'right',
      edgeWidth: 50,
    },
  );

  const AppContainer = createAppContainer(AppDrawer);

  return (
    <ApolloProvider client={client}>
      <AppContainer />
    </ApolloProvider>
  );
};

const styles = StyleSheet.create({
  logoutBtn: {
    backgroundColor: '#e32a6c',
    width: 100,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    margin: 15,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 18,
  },
  bottomTabBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  bottomTabText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  focused: {
    color: '#e32a6c',
  },
});

export default App;
