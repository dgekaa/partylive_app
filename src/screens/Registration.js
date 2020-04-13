import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  AsyncStorage,
} from 'react-native';

import {Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';

const REGISTER = gql`
  mutation REGISTER(
    $name: String!
    $password: String!
    $password_confirmation: String!
    $email: String!
  ) {
    register(
      input: {
        name: $name
        password: $password
        password_confirmation: $password_confirmation
        email: $email
      }
    ) {
      status
      tokens {
        access_token
        refresh_token
        expires_in
        token_type
        user {
          name
          email
        }
      }
    }
  }
`;

const Registration = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');
  const [name, setName] = useState('');

  const [nameErr, setNameErr] = useState(false);
  const [passwordErr, setPasswordErr] = useState(false);
  const [repasswordErr, setRepasswordErr] = useState(false);
  const [emailErr, setEmailErr] = useState(false);

  const registerHandle = (res) => {
    props.changeLoginState(true, res.data.register.tokens.access_token);
    props.navigation.navigate('Home');

    setName('');
    setEmail('');
    setPassword('');
    setRepassword('');
  };

  const registerErrHandle = (err) => {
    console.log(err.message, ' __ERR');

    if (name.length === 0) {
      return setNameErr(true);
    }
    setNameErr(false);

    if (email.length === 0) {
      return setEmailErr(true);
    }
    setEmailErr(false);

    if (password.length === 0 || password.length < 8) {
      return setPasswordErr(true);
    }
    setPasswordErr(false);

    if (repassword.length === 0 || repassword.length < 8) {
      return setRepasswordErr(true);
    }
    setRepasswordErr(false);

    if (password !== repassword) {
      setPasswordErr(true);
      setRepasswordErr(true);
      return;
    }
    setPasswordErr(false);
    setRepasswordErr(false);

    setEmailErr(true);
  };

  return (
    <View style={styles.login}>
      <Mutation mutation={REGISTER}>
        {(addMutation, {data}) => {
          return (
            <View style={styles.loginForm}>
              <Text style={styles.headText}>Регистрация</Text>
              <TextInput
                placeholder="name"
                style={[styles.input, nameErr ? {borderColor: 'red'} : {}]}
                onChangeText={(name) => {
                  setName(name);
                }}
                value={name}
              />
              <TextInput
                placeholder="email"
                style={[styles.input, emailErr ? {borderColor: 'red'} : {}]}
                onChangeText={(email) => {
                  setEmail(email);
                }}
                value={email}
              />
              <TextInput
                placeholder="password"
                style={[styles.input, passwordErr ? {borderColor: 'red'} : {}]}
                secureTextEntry
                onChangeText={(pass) => {
                  setPassword(pass);
                }}
                value={password}
              />
              <TextInput
                placeholder="repassword"
                style={[
                  styles.input,
                  repasswordErr ? {borderColor: 'red'} : {},
                ]}
                secureTextEntry
                onChangeText={(repass) => {
                  setRepassword(repass);
                }}
                value={repassword}
              />
              <TouchableOpacity
                style={styles.btn}
                onPress={() => {
                  addMutation({
                    variables: {
                      name: name,
                      email: email,
                      password: password,
                      password_confirmation: repassword,
                    },
                  })
                    .then((res) => {
                      registerHandle(res);
                    })
                    .catch((err) => {
                      registerErrHandle(err);
                    });
                }}>
                <Text style={styles.btnText}>Зарегистрироваться</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      </Mutation>
    </View>
  );
};

const styles = StyleSheet.create({
  login: {
    flex: 1,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default Registration;
