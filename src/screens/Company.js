import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import VideoPlayer from 'react-native-video-controls';

import {EN_SHORT_TO_RU_LONG_V_P} from '../constants';
import {isShowStreamNow, isWorkTimeNow} from '../calculateTime';
import Header from '../components/Header';
import {TouchableOpacity} from 'react-native-gesture-handler';

import bar from '../img/bar.png';
import karaoke from '../img/karaoke.png';
import klub from '../img/klub.png';
import launge from '../img/launge.png';
import pab from '../img/pab.png';

const Company = (props) => {
  const {
    data: {name, address, streams, categories},
    distanceTo,
  } = props.navigation.state.params;

  const dataCompany = props.navigation.state.params.data;

  const [showStream, setShowStream] = useState();
  const [nextStreamTime, setNextStreamTime] = useState();
  const [workTime, setWorkTime] = useState();
  const [isWork, setIsWork] = useState();

  useEffect(() => {
    isShowStreamNow(dataCompany, setShowStream, setNextStreamTime);
    isWorkTimeNow(dataCompany, setWorkTime, setIsWork);
  }, [dataCompany]);

  const whenIsTranslationTime = () => {
    if (
      nextStreamTime &&
      nextStreamTime.start_time &&
      nextStreamTime.day.toLowerCase() !== 'сегодня'
    ) {
      return (
        'Трансляция начнется в ' +
        EN_SHORT_TO_RU_LONG_V_P[nextStreamTime.day] +
        ' в ' +
        nextStreamTime.start_time
      );
    } else if (
      nextStreamTime &&
      nextStreamTime.start_time &&
      nextStreamTime.day.toLowerCase() === 'сегодня'
    ) {
      return 'Трансляция начнется сегодня в ' + nextStreamTime.start_time;
    } else if (!nextStreamTime) {
      return 'Заведение закрыто';
    }
  };

  const whenIsWorkTime = () => {
    if (!isWork) {
      return 'Закрыто';
    } else {
      if (workTime) {
        return 'Открыто до ' + workTime.split('-')[1];
      } else {
        return 'Время работы не задано';
      }
    }
  };

  const getImg = () => {
    switch (categories[0].slug) {
      case 'bar':
        return bar;
      case 'klub':
        return klub;
      case 'launge':
        return launge;
      case 'pab':
        return pab;
      case 'karaoke':
        return karaoke;
    }
  };

  return (
    <View style={styles.Company}>
      <Header props={props} />
      <View style={styles.content}>
        <View style={styles.videoWrap}>
          {showStream ? (
            <VideoPlayer
              source={{uri: streams[0].url}}
              disableSeekbar
              disableTimer
              disableBack
              disableFullscreen
              toggleResizeModeOnFullscreen={false}
            />
          ) : (
            <View style={styles.backgroundVideo}>
              <Text style={styles.noVideoText}>{whenIsTranslationTime()}</Text>
            </View>
          )}
        </View>
        <View style={styles.descriptionWrap}>
          <View style={styles.descBeforeMap}>
            <View style={styles.descRow}>
              <Text style={styles.name}>{name}</Text>
              <TouchableOpacity>
                <Image
                  style={styles.icon}
                  source={require('../img/back.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.categoryRow}>
              <Image style={styles.icon} source={getImg()} />
              <Text style={styles.category}>{categories[0].name}</Text>
            </View>

            <View style={styles.workTimeRow}>
              <View
                style={[
                  styles.circle,
                  isWork
                    ? {backgroundColor: '#04B000'}
                    : {backgroundColor: '#e32a6c'},
                ]}
              />
              <Text style={styles.workTime}>{whenIsWorkTime()}</Text>
            </View>
          </View>

          <View style={styles.mapBlockWrap}>
            <View style={styles.mapWrap} />
            <View style={styles.locationBlock}>
              <Image
                style={styles.icon}
                source={require('../img/location.png')}
              />
              <Text style={styles.locationText}>{address}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Company: {
    flex: 1,
    backgroundColor: '#eee',
  },
  content: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },

  videoWrap: {
    flex: 1.5,
    borderRadius: 5,
    overflow: 'hidden',
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
    fontSize: 18,
  },
  descriptionWrap: {
    flex: 1.5,
    padding: 5,
  },
  descBeforeMap: {
    marginHorizontal: 10,
  },
  descRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  km: {
    fontWeight: 'bold',
    color: 'rgb(227, 42, 108)',
  },
  workTime: {
    fontWeight: 'normal',
    fontSize: 14,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontWeight: 'normal',
    fontSize: 14,
  },
  workTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    height: 7,
    width: 7,
    borderRadius: 7,
    marginRight: 14.5,
    marginLeft: 4.5,
  },
  mapBlockWrap: {
    flex: 1,
    margin: 10,
    borderColor: '#ededed',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  mapWrap: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: '#999',
  },
  locationBlock: {
    flexDirection: 'row',
    padding: 5,
    alignItems: 'center',
  },
  icon: {
    height: 16,
    width: 16,
    marginRight: 10,
  },
  locationText: {
    fontWeight: 'normal',
    fontSize: 14,
  },
});

export default Company;
