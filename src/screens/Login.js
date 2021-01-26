import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import {Mutation} from 'react-apollo';

import Header from '../components/Header';
import QueryIndicator from '../components/QueryIndicator';
import {LOGIN} from '../QUERYES';

const Login = (props) => {
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [validationError, setValidationError] = useState(''),
    [loginIndicator, setLoginIndicator] = useState(false);

  const clearAllInputs = () => {
    setEmail('');
    setPassword('');
    setValidationError('');
  };

  const loginClick = (addMutation) => {
    setLoginIndicator(true);
    addMutation({
      variables: {
        username: email,
        password,
      },
    })
      .then((res) => {
        setLoginIndicator(false);
        props.navigation.state.params.changeLoginState(
          true,
          res.data.login.access_token,
          res.data.login.user.id,
        );
        props.navigation.navigate('Home');
        clearAllInputs();
      })
      .catch(() => {
        setValidationError('Неверный логин либо пароль');
        setLoginIndicator(false);
      });
  };

  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
      <View style={styles.loginWrap}>
        <Header props={props} />
        <View style={styles.login}>
          <Mutation mutation={LOGIN}>
            {(addMutation) => {
              return (
                <View style={styles.loginForm}>
                  <Text style={styles.headText}>Авторизация</Text>
                  <TextInput
                    placeholder="email"
                    style={[styles.input, validationError && styles.borderErr]}
                    onChangeText={(em) => setEmail(em)}
                    value={email}
                  />
                  <TextInput
                    placeholder="password"
                    style={[styles.input, validationError && styles.borderErr]}
                    secureTextEntry
                    onChangeText={(pass) => setPassword(pass)}
                    value={password}
                  />
                  <Text style={styles.validationError}>{validationError}</Text>
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() => loginClick(addMutation)}>
                    <Text style={styles.btnText}>Вход</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          </Mutation>
        </View>
      </View>
      {loginIndicator && <QueryIndicator />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loginWrap: {
    flex: 1,
  },
  login: {
    flex: 1,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginForm: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    justifyContent: 'center',
  },
  headText: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    marginTop: 10,
    height: 45,
    paddingHorizontal: 10,
  },
  btn: {
    borderRadius: 5,
    marginTop: 10,
    height: 45,
    backgroundColor: '#e32a6c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  validationError: {
    color: 'red',
    textAlign: 'center',
    paddingTop: 10,
    opacity: 0.6,
  },
  borderErr: {
    borderColor: 'red',
  },
});

export default Login;
