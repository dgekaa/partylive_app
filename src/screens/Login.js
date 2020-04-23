import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import Header from '../components/Header';

import {Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';

const LOGIN = gql`
  mutation LOGIN($username: String!, $password: String!) {
    login(input: {username: $username, password: $password}) {
      access_token
      user {
        id
        name
        email
      }
    }
  }
`;

const Login = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [validationError, setValidationError] = useState('');

  return (
    <View style={styles.loginWrap}>
      <Header props={props} />
      <View style={styles.login}>
        <Mutation mutation={LOGIN}>
          {(addMutation, {data}) => {
            return (
              <View style={styles.loginForm}>
                <Text style={styles.headText}>Авторизация</Text>
                <TextInput
                  placeholder="email"
                  style={[
                    styles.input,
                    validationError ? {borderColor: 'red'} : {},
                  ]}
                  onChangeText={(email) => {
                    setEmail(email);
                  }}
                  value={email}
                />
                <TextInput
                  placeholder="password"
                  style={[
                    styles.input,
                    validationError ? {borderColor: 'red'} : {},
                  ]}
                  secureTextEntry
                  onChangeText={(pass) => {
                    setPassword(pass);
                  }}
                  value={password}
                />
                <Text style={styles.validationError}>{validationError}</Text>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => {
                    addMutation({
                      variables: {
                        username: email,
                        password: password,
                      },
                    })
                      .then((res) => {
                        props.navigation.state.params.changeLoginState(
                          true,
                          res.data.login.access_token,
                        );
                        props.navigation.navigate('Home');
                        setEmail('');
                        setPassword('');
                        setValidationError('');
                      })
                      .catch((err) => {
                        setValidationError('Неверный логин либо пароль');
                        console.log(err.message, '______err');
                      });
                  }}>
                  <Text style={styles.btnText}>Вход</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </Mutation>
      </View>
    </View>
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
});

export default Login;
