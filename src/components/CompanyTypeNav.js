import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, FlatList} from 'react-native';

const CompanyTypeNav = ({data, clickedType}) => {
  const [buttonActive, setButtonActive] = useState(0);
  const navigationFlatList = useRef(null);

  const [DATA, setDATA] = useState([]);

  useEffect(() => {
    if (data && data.categories) {
      setDATA([{id: 0, name: 'Все'}, ...data.categories]);
    }
  }, [data]);
  return (
    <View style={styles.CompanyTypeNav}>
      {!!DATA.length && (
        <FlatList
          style={styles.flatList}
          ref={navigationFlatList}
          data={DATA}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({item, index}) => (
            <TouchableOpacity
              style={
                buttonActive == item.id
                  ? styles.buttonActive
                  : styles.buttonNotActive
              }
              onPress={(e) => {
                clickedType(item.name);
                navigationFlatList.current.scrollToIndex({
                  animated: true,
                  index: index,
                  viewPosition: 0.5,
                });
                setButtonActive(item.id);
              }}>
              <Text
                style={
                  buttonActive == item.id ? {color: '#FFF'} : {color: '#000'}
                }>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => '' + item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  CompanyTypeNav: {},
  flatList: {
    padding: 10,
  },
  buttonNotActive: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
    borderColor: '#ededed',
    borderWidth: 1,
    height: 30,
    borderRadius: 10,
    marginRight: 10,
    paddingHorizontal: 5,
    backgroundColor: '#fff',
  },
  buttonActive: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
    borderColor: '#ededed',
    borderWidth: 1,
    height: 30,
    borderRadius: 10,
    marginRight: 10,
    paddingHorizontal: 5,
    backgroundColor: '#e32a6c',
  },
});

export default CompanyTypeNav;
