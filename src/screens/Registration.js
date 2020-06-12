import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {Mutation} from 'react-apollo';

import Header from '../components/Header';
import {REGISTER} from '../QUERYES';

const Registration = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState(false);
  const [passwordErr, setPasswordErr] = useState(false);
  const [repasswordErr, setRepasswordErr] = useState(false);
  const [emailErr, setEmailErr] = useState(false);

  const clearAllInputs = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRepassword('');
  };

  const registerHandle = (res) => {
    props.navigation.state.params.changeLoginState(
      true,
      res.data.register.tokens.access_token,
    );
    props.navigation.navigate('Home');

    clearAllInputs();
  };

  const registerErrHandle = () => {
    if (name.length === 0) return setNameErr('Поле обязательно для ввода');
    setNameErr(false);
    if (email.length === 0) return setEmailErr('Поле обязательно для ввода');
    setEmailErr(false);
    if (password.length === 0 || password.length < 8)
      return setPasswordErr('Поле не менее 8 символов');
    setPasswordErr(false);
    if (repassword.length === 0 || repassword.length < 8)
      return setRepasswordErr('Поле не менее 8 символов');
    setRepasswordErr(false);
    if (password !== repassword) {
      setPasswordErr('Пароли не совпадают');
      setRepasswordErr('Пароли не совпадают');
      return;
    }
    setPasswordErr(false);
    setRepasswordErr(false);
    setEmailErr('Email не валиден либо уже существует');
  };

  return (
    <View style={styles.loginWrap}>
      <Header props={props} />
      <View style={styles.login}>
        <Mutation mutation={REGISTER}>
          {(addMutation) => {
            return (
              <View style={styles.loginForm}>
                <Text style={styles.headText}>Регистрация</Text>
                <TextInput
                  placeholder="name"
                  style={[styles.input, nameErr && styles.borderErr]}
                  onChangeText={(n) => setName(n)}
                  value={name}
                />
                <TextInput
                  placeholder="email"
                  style={[styles.input, emailErr && styles.borderErr]}
                  onChangeText={(em) => setEmail(em)}
                  value={email}
                />
                <TextInput
                  placeholder="password"
                  style={[styles.input, passwordErr && styles.borderErr]}
                  secureTextEntry
                  onChangeText={(pass) => setPassword(pass)}
                  value={password}
                />
                <TextInput
                  placeholder="repassword"
                  style={[styles.input, repasswordErr && styles.borderErr]}
                  secureTextEntry
                  onChangeText={(repass) => setRepassword(repass)}
                  value={repassword}
                />
                <Text style={styles.validationErr}>
                  {nameErr || emailErr || passwordErr || repasswordErr}
                </Text>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => {
                    addMutation({
                      variables: {
                        name,
                        email,
                        password,
                        password_confirmation: repassword,
                      },
                    })
                      .then((res) => registerHandle(res))
                      .catch((err) => registerErrHandle(err));
                  }}>
                  <Text style={styles.btnText}>Зарегистрироваться</Text>
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
  validationErr: {
    color: 'red',
    opacity: 0.6,
    textAlign: 'center',
    paddingTop: 10,
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
  borderErr: {
    borderColor: 'red',
  },
});

export default Registration;
