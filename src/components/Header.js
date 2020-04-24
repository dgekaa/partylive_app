import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

const CustomHeader = ({props}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => props.navigation.goBack()}>
        {props.navigation.goBack && <Text style={styles.goBack}>{'<'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.navigation.navigate('Home')}>
        <View style={styles.PLLogo}>
          <Text style={styles.party}> PARTY</Text>
          <View style={styles.partyWrap}>
            <Text style={styles.live}>.LIVE</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.burgerWrap}
        onPress={() => props.navigation.openDrawer()}>
        <View style={styles.burgerOne} />
        <View style={styles.burgerOne} />
        <View style={styles.burgerOne} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#ededed',
    borderBottomWidth: 1,
  },
  goBack: {
    fontSize: 25,
  },
  PLLogo: {
    flexDirection: 'row',
  },
  partyWrap: {
    backgroundColor: 'rgb(227, 42, 108)',
    borderRadius: 5,
  },
  party: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 25,
    marginRight: 5,
  },
  live: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 5,
  },
  burgerWrap: {
    width: 30,
    height: 20,
    justifyContent: 'space-between',
  },
  burgerOne: {
    height: 2,
    backgroundColor: '#000',
    borderRadius: 2,
  },
});

export default CustomHeader;
