import React, {useEffect, useState} from 'react';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
  Animated,
  SafeAreaView,
} from 'react-native';

import {useQuery} from 'react-apollo';

import {EN_SHORT_DAY_OF_WEEK} from '../../constants';
import Stream from './Stream';
import Header from '../../components/Header';
import QueryIndicator from '../../components/QueryIndicator';
import {GET_PLACE} from '../../QUERYES';
import WorkSchedule from './WorkSchedule';
import StreamSchedule from './StreamSchedule';
import Translation from './Translation';
import NewAddress from './NewAddress';
import Category from './Category';
import Description from './Description';
import Profile from './Profile';

const Admin = (props) => {
  const {streams} = props.navigation.state.params.item;

  const [inputName, setInputName] = useState(''),
    [inputAlias, setInputAlias] = useState(''),
    [inputDesc, setInputDesc] = useState(
      data && data.place && data.place.description && data.place.description,
    ),
    [queryIndicator, setQueryIndicator] = useState(false);

  const {loading, error, data} = useQuery(GET_PLACE, {
    variables: {id: props.navigation.state.params.item.id},
  });

  const SetNewTimeObject = (data) => {
    const timeObject = {};
    EN_SHORT_DAY_OF_WEEK.forEach((e, i) => {
      data.forEach((el) => {
        if (!timeObject[e.day]) timeObject[e.day] = 'Пусто';
        if (el.day) timeObject[el.day] = el;
      });
    });
    return timeObject;
  };

  const windowWidth = Dimensions.get('window').width,
    tomorrowFromDay = (day) => (day === 6 ? 0 : day + 1),
    streamValue = useState(new Animated.Value(-windowWidth))[0],
    profileValue = useState(new Animated.Value(-windowWidth))[0],
    workScheduleValue = useState(new Animated.Value(-windowWidth))[0],
    streamScheduleValue = useState(new Animated.Value(-windowWidth))[0],
    translationValue = useState(new Animated.Value(-windowWidth))[0],
    chooseCategoryValue = useState(new Animated.Value(-windowWidth))[0],
    descriptionValue = useState(new Animated.Value(-windowWidth))[0],
    addressValue = useState(new Animated.Value(-windowWidth))[0],
    adminBtns = [
      {
        moveIn: streamValue,
        name: 'Стрим',
      },
      {
        moveIn: profileValue,
        name: 'Профиль заведения',
      },
      {
        moveIn: workScheduleValue,
        name: 'График работы',
      },
      {
        moveIn: streamScheduleValue,
        name: 'График стримов',
      },
    ];

  const moveIn = (data) =>
      Animated.timing(data, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start(),
    moveOut = (data) =>
      Animated.timing(data, {
        toValue: -windowWidth,
        duration: 200,
        useNativeDriver: true,
      }).start();

  useEffect(() => {
    if (data || error) {
      setQueryIndicator(false);
    } else if (loading) {
      setQueryIndicator(true);
    }
  }, [data, loading, error]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>`Error! ${error.message}`</Text>;

  return (
    <View style={styles.Admin}>
      <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
        <Header props={props} />
        <View style={styles.AdminInner}>
          {adminBtns.map((el, i) => (
            <TouchableOpacity
              key={i}
              style={styles.oneBlock}
              onPress={() => moveIn(el.moveIn)}>
              <Text style={styles.oneBlockText}>{el.name}</Text>
              <Text style={styles.oneBlockArrow}>&#62;</Text>
            </TouchableOpacity>
          ))}
          {!data.place.streams[0] && (
            <View>
              <TouchableOpacity
                style={styles.oneBlock}
                onPress={() => moveIn(translationValue)}>
                <Text style={styles.oneBlockText}>Трансляции</Text>
                <Text style={styles.oneBlockArrow}>&#62;</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Stream
          streamValue={streamValue}
          navigation={props.navigation}
          streams={streams}
          data={data}
          moveOut={moveOut}
        />
        <Profile
          navigation={props.navigation}
          profileValue={profileValue}
          moveOut={moveOut}
          moveIn={moveIn}
          data={data}
          setInputName={setInputName}
          inputName={inputName}
          inputAlias={inputAlias}
          setInputAlias={setInputAlias}
          inputDesc={inputDesc}
          chooseCategoryValue={chooseCategoryValue}
          descriptionValue={descriptionValue}
          addressValue={addressValue}
        />
        <Category
          navigation={props.navigation}
          chooseCategoryValue={chooseCategoryValue}
          moveOut={moveOut}
          data={data}
        />
        <Description
          navigation={props.navigation}
          data={data}
          descriptionValue={descriptionValue}
          moveOut={moveOut}
          setInputName={setInputName}
          setInputAlias={setInputAlias}
          setInputDesc={setInputDesc}
        />
        <NewAddress
          navigation={props.navigation}
          addressValue={addressValue}
          moveOut={moveOut}
          data={data}
        />
        <WorkSchedule
          workScheduleValue={workScheduleValue}
          navigation={props.navigation}
          moveOut={moveOut}
          SetNewTimeObject={(data) => SetNewTimeObject(data)}
          data={data}
          tomorrowFromDay={(data) => tomorrowFromDay(data)}
        />
        <StreamSchedule
          streamScheduleValue={streamScheduleValue}
          navigation={props.navigation}
          moveOut={moveOut}
          SetNewTimeObject={(data) => SetNewTimeObject(data)}
          data={data}
          tomorrowFromDay={(data) => tomorrowFromDay(data)}
        />
        <Translation
          navigation={props.navigation}
          translationValue={translationValue}
          moveOut={moveOut}
          data={data}
        />
      </SafeAreaView>
      {queryIndicator && <QueryIndicator />}
    </View>
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
  Admin: {
    height: Dimensions.get('window').height,
    flex: 1,
  },
  AdminInner: {
    flex: 1,
    paddingTop: 10,
  },
  oneBlock: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  oneBlockText: {
    fontSize: 18,
  },
  oneBlockArrow: {
    fontSize: 22,
    color: '#BDBDBD',
  },
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
});

export default Admin;
