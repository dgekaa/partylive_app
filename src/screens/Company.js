import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';

import Video from 'react-native-video';

import {EN_SHORT_TO_RU_LONG_V_P} from '../constants';
import {isShowStreamNow, isWorkTimeNow} from '../calculateTime';

import Header from '../components/Header';

const Company = (props) => {
  console.log(props, ' COMPANY SS ');
  const {
    name,
    address,
    streams,
    categories,
  } = props.navigation.state.params.data;

  const [showStream, setShowStream] = useState();
  const [nextStreamTime, setNextStreamTime] = useState();
  const [workTime, setWorkTime] = useState();
  const [isWork, setIsWork] = useState();

  useEffect(() => {
    isShowStreamNow(
      props.navigation.state.params.data,
      setShowStream,
      setNextStreamTime,
    );

    isWorkTimeNow(props.navigation.state.params.data, setWorkTime, setIsWork);
  }, [props.navigation.state.params.data]);

  return (
    <View style={styles.home}>
      <Header props={props} />
      <View style={styles.content}>
        <View style={styles.videoBlockWrap}>
          <View style={styles.videoWrap}>
            {showStream ? (
              <Video
                resizeMode="contain"
                source={{uri: streams[0].url}}
                //  ref={(ref) => {
                //    this.player = ref
                //  }}
                onBuffer={(buf) => console.log(buf)}
                onError={(err) => console.log(err, '_ERR_')}
                style={styles.backgroundVideo}
              />
            ) : (
              <View style={styles.backgroundVideo}>
                <Text style={styles.noVideoText}>
                  {nextStreamTime &&
                    nextStreamTime.start_time &&
                    nextStreamTime.day.toLowerCase() !== 'сегодня' &&
                    'Трансляция начнется в ' +
                      EN_SHORT_TO_RU_LONG_V_P[nextStreamTime.day] +
                      ' в ' +
                      nextStreamTime.start_time}
                  {nextStreamTime &&
                    nextStreamTime.start_time &&
                    nextStreamTime.day.toLowerCase() === 'сегодня' &&
                    'Трансляция начнется сегодня в ' +
                      nextStreamTime.start_time}

                  {!nextStreamTime && 'Нет предстоящих трансляций'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.descriptionWrap}>
            <View style={styles.descRow}>
              <Text style={styles.name}>
                {categories[0].name} "{name}"
              </Text>
              <Text style={styles.km}>
                {props.navigation.state.params.distanceTo
                  ? props.navigation.state.params.distanceTo
                  : 0}{' '}
                km.
              </Text>
            </View>
            <Text style={styles.workTime}>
              {!isWork
                ? 'Закрыто'
                : workTime
                ? 'Открыто до ' + workTime.split('-')[1]
                : 'Время работы не задано'}
            </Text>
          </View>
        </View>
        <View style={styles.mapBlockWrap}>
          <View style={styles.mapWrap}>
            <Text>mapWrap</Text>
          </View>
          <View style={styles.mapWrapText}>
            <Text>{address}</Text>
          </View>
        </View>
      </View>
      {/* <BottomTabNavigator navigation={navigation} route={route} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  home: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  videoBlockWrap: {
    flex: 2,
    borderColor: '#ededed',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  videoWrap: {
    flex: 1,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'black',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideoText: {
    color: '#fff',
  },
  descriptionWrap: {
    padding: 5,
  },
  descRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  km: {
    fontWeight: 'bold',
    color: 'rgb(227, 42, 108)',
  },
  workTime: {
    fontWeight: 'bold',
    color: 'green',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  mapBlockWrap: {
    flex: 1,
    marginVertical: 10,
    borderColor: '#ededed',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  mapWrap: {
    flex: 1,
    borderRadius: 5,
  },
  mapWrapText: {
    padding: 5,
  },
});

export default Company;
