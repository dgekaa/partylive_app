import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';

const QueryIndicator = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="green" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: '#eee',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    opacity: 0.2,
  },
});

export default QueryIndicator;
