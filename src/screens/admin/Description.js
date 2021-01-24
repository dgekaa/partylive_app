import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  Animated,
  StatusBar,
  Dimensions,
  SafeAreaView,
  TextInput,
} from 'react-native';
import AdminHeader from './AdminHeader';
import {useMutation} from 'react-apollo';
import {GET_PLACE, UPDATE_PLACE_DATA} from '../../QUERYES';

const Description = ({
  navigation,
  data,
  descriptionValue,
  moveOut,
  setInputAlias,
  setInputName,
  setInputDesc,
}) => {
  const refreshObject = {
    refetchQueries: [
      {
        query: GET_PLACE,
        variables: {id: navigation.state.params.item.id},
      },
    ],
    awaitRefetchQueries: true,
  };

  const decriptionLengthLimit = 300;

  const [inputDescription, setInputDescription] = useState(isDescription);

  const [UPDATE_PLACE_DATA_mutation] = useMutation(
    UPDATE_PLACE_DATA,
    refreshObject,
  );

  const isDescription = data && data.place && data.place.description,
    isPlace = data && data.place;

  const setDesc = (data) => {
    setInputDescription(data);
    setInputDesc(data);
  };

  const saveDescription = () => {
    UPDATE_PLACE_DATA_mutation({
      variables: {
        id: isPlace.id,
        description: inputDescription || isDescription,
      },
      optimisticResponse: null,
    }).then(
      (res) => console.log(res, 'desc RES'),
      (err) => console.log(err, 'desc ERR'),
    );
  };

  useEffect(() => {
    isDescription && setDesc(isDescription);

    isPlace && isPlace.alias && setInputAlias(isPlace.alias);
    isPlace && isPlace.name && setInputName(isPlace.name);
  }, []);

  return (
    <Animated.ScrollView
      style={[
        styles.sliderAdminMenu,
        {transform: [{translateX: descriptionValue}, {perspective: 1000}]},
      ]}>
      <SafeAreaView style={{flex: 1}}>
        <AdminHeader
          cancel
          ready
          saveFunction={() => saveDescription()}
          cancelFunction={() => {
            isDescription ? setDesc(isDescription) : setDesc('');
          }}
          navigation={navigation}
          moveOut={moveOut}
          who={descriptionValue}
        />
        <Text style={styles.headerAdminTitle}>Описание</Text>
        <TextInput
          maxLength={decriptionLengthLimit}
          multiline={true}
          style={styles.textInputDesc}
          onChangeText={(text) => setDesc(text)}
          value={inputDescription}
        />
        <Text
          style={[
            styles.textDescLimit,
            inputDescription
              ? inputDescription.length === decriptionLengthLimit
                ? {color: 'red'}
                : {color: 'green'}
              : isDescription.length === decriptionLengthLimit
              ? {color: 'red'}
              : {color: 'green'},
          ]}>
          {inputDescription ? inputDescription.length : isDescription.length}/{' '}
          {decriptionLengthLimit}
        </Text>
      </SafeAreaView>
    </Animated.ScrollView>
  );
};

const isIPhoneX = () => {
  const dimen = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 812 ||
      dimen.width === 812 ||
      dimen.height === 896 ||
      dimen.width === 896)
  );
};

const getStatusBarHeight = (skipAndroid) => {
  return Platform.select({
    ios: isIPhoneX() ? 44 : 20,
    android: skipAndroid ? 0 : StatusBar.currentHeight,
    default: 0,
  });
};

const styles = StyleSheet.create({
  sliderAdminMenu: {
    position: 'absolute',
    // top: getStatusBarHeight(),
    top: 0, // в андроиде смещалось вниз
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    width: '100%',
    translateX: -Dimensions.get('window').width,
    flex: 1,
  },
  headerAdminTitle: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
    fontSize: 18,
  },
  textInputDesc: {
    margin: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    fontWeight: '300',
    fontSize: 16,
    color: '#4f4f4f',
    lineHeight: 24,
  },
  textDescLimit: {
    textAlign: 'right',
    fontSize: 12,
    marginRight: 10,
  },
});

export default Description;
