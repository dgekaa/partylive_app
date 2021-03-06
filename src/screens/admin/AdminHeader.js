import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';

const AdminHeader = ({
  cancel,
  ready,
  moveOut,
  who,
  videoPause,
  navigation,
  saveFunction,
  cancelFunction,
  disableMobileStream,
}) => {
  const goBackClick = () => {
      moveOut(who);
      disableMobileStream && disableMobileStream();
      videoPause && videoPause();
      cancelFunction && cancelFunction();
    },
    goHomeClick = () => {
      navigation.navigate('Home');
      disableMobileStream && disableMobileStream();
    },
    burgerClick = () => navigation.openDrawer(),
    readyClick = () => {
      moveOut(who);
      videoPause && videoPause();
      saveFunction && saveFunction();
    };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => goBackClick()}>
        {!cancel ? (
          <View style={styles.goBackBlock}>
            <Image
              style={styles.goBack}
              source={require('../../img/arrow.png')}
            />
          </View>
        ) : (
          <Text style={styles.headerBtn}>Отмена</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => goHomeClick()}>
        <View style={styles.PLLogo}>
          <Text style={styles.party}>PARTY</Text>
          <View style={styles.partyWrap}>
            <Text style={styles.live}>.LIVE</Text>
          </View>
        </View>
      </TouchableOpacity>
      {!ready ? (
        <TouchableOpacity
          style={styles.burgerWrap}
          onPress={() => burgerClick()}>
          <View style={styles.burgerOne} />
          <View style={styles.burgerOne} />
          <View style={styles.burgerOne} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => readyClick()}>
          <Text style={styles.headerBtn}>Готово</Text>
        </TouchableOpacity>
      )}
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
    backgroundColor: '#fff',
  },
  goBackBlock: {
    width: 30,
    height: 30,
  },
  goBack: {},
  headerBtn: {
    fontSize: 16,
    color: '#e32a6c',
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

export default AdminHeader;
