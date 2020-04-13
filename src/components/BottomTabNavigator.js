import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

const BottomTabNavigator = ({navigation, route}) => {
  return (
    <View style={styles.BottomTabNavigator}>
      <TouchableOpacity
        style={[
          styles.btn,
          styles.btn1,
          route.name === 'Map'
            ? {backgroundColor: 'rgb(227, 42, 108)'}
            : {backgroundColor: '#fff'},
        ]}
        onPress={() => {
          navigation.navigate('Map');
        }}>
        <Text
          style={[
            styles.btnText,
            route.name === 'Map' ? {color: '#fff'} : {color: '#000'},
          ]}>
          Карта
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.btn,
          styles.btn2,
          route.name === 'Home'
            ? {backgroundColor: 'rgb(227, 42, 108)'}
            : {backgroundColor: '#fff'},
        ]}
        onPress={() => {
          navigation.navigate('Home');
        }}>
        <Text
          style={[
            styles.btnText,
            route.name === 'Home' ? {color: '#fff'} : {color: '#000'},
          ]}>
          Главная
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  BottomTabNavigator: {
    height: 51,
    backgroundColor: '#fff',
    borderTopColor: '#e5e5e5',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: 70,
    height: 30,
    borderColor: '#e5e5e5',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn1: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderRightWidth: 0,
  },
  btn2: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  btnText: {
    fontWeight: 'bold',
  },
});

export default BottomTabNavigator;
