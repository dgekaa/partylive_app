import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  StatusBar,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useMutation} from 'react-apollo';
import Dialog, {ScaleAnimation, DialogContent} from 'react-native-popup-dialog';
import DateTimePicker from '@react-native-community/datetimepicker';
import QueryIndicator from '../../components/QueryIndicator';

import AdminHeader from './AdminHeader';
import {numberDayNow} from '../../calculateTime';
import {
  GET_PLACE,
  DELETE_SCHEDULE,
  UPDATE_STREAMS_SCHEDULE,
  CREATE_STREAMS_SCHEDULE,
} from '../../QUERYES';
import {
  EN_SHORT_DAY_OF_WEEK,
  EN_SHORT_TO_RU_SHORT,
  SHORT_DAY_OF_WEEK,
  EN_SHORT_TO_NUMBER,
} from '../../constants';

const StreamSchedule = ({
  navigation,
  streamScheduleValue,
  moveOut,
  SetNewTimeObject,
  data,
  tomorrowFromDay,
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

  const [UPDATE_STREAMS_SCHEDULE_mutation] = useMutation(
      UPDATE_STREAMS_SCHEDULE,
      refreshObject,
    ),
    [CREATE_STREAMS_SCHEDULE_mutation] = useMutation(
      CREATE_STREAMS_SCHEDULE,
      refreshObject,
    ),
    [DELETE_SCHEDULE_mutation] = useMutation(DELETE_SCHEDULE, refreshObject);

  const [selectedDay, setSelectedDay] = useState(false),
    [enumWeekName, setEnumWeekName] = useState(''),
    [popupVisible, setPopupVisible] = useState(false),
    [show, setShow] = useState(false),
    [mode, setMode] = useState('date'),
    [date, setDate] = useState(new Date()),
    [pickedStartTime, setPickedStartTime] = useState(''),
    [pickedEndTime, setPickedEndTime] = useState(''),
    [isPickStartTime, setIsPickStartTime] = useState(false),
    [queryIndicator, setQueryIndicator] = useState(false);

  useEffect(() => {
    setPickedStartTime('');
    setPickedEndTime('');
  }, [popupVisible]);

  const onChangeTime = (event, selectedTime) => {
    const currentDate = selectedTime || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);

    const hours = selectedTime.getHours(),
      minutes = selectedTime.getMinutes();

    const time =
      '' +
      (hours > 9 ? hours : '0' + hours) +
      ':' +
      (minutes > 9 ? minutes : '0' + minutes);

    if (isPickStartTime) {
      setPickedStartTime(time);
    } else {
      setPickedEndTime(time);
    }
  };

  const showTimepicker = () => {
    setShow(true);
    setMode('time');
  };

  const saveStreamTime = () => {
    if (!selectedDay.id) {
      if (pickedStartTime && pickedEndTime) {
        setPopupVisible(false);
        setQueryIndicator(true);
        CREATE_STREAMS_SCHEDULE_mutation({
          variables: {
            id: data.place.streams[0].id,
            day: enumWeekName,
            start_time: pickedStartTime,
            end_time: pickedEndTime,
          },
          optimisticResponse: null,
        }).then(
          (res) => {
            console.log(res, 'RES');
            setQueryIndicator(false);
          },
          (err) => {
            console.log(err, 'ERR');
            setQueryIndicator(false);
          },
        );
      }
    } else {
      if ((pickedStartTime && pickedEndTime) || selectedDay.start_time) {
        setPopupVisible(false);
        setQueryIndicator(true);

        UPDATE_STREAMS_SCHEDULE_mutation({
          variables: {
            id: data.place.streams[0].id,
            update: [
              {
                id: selectedDay.id,
                start_time: pickedStartTime || selectedDay.start_time,
                end_time: pickedEndTime || selectedDay.end_time,
              },
            ],
          },
          optimisticResponse: null,
        }).then(
          (res) => {
            console.log(res, 'RES');
            setQueryIndicator(false);
          },
          (err) => {
            console.log(err, 'ERR');
            setQueryIndicator(false);
          },
        );
      }
    }
  };

  const setAsDayOf = (day) => {
    if (day.id) {
      setQueryIndicator(true);

      DELETE_SCHEDULE_mutation({
        variables: {
          id: day.id,
        },
        optimisticResponse: null,
      }).then(
        (res) => {
          console.log(res, '____RES____');
          setQueryIndicator(false);
        },
        (err) => {
          console.log(err, '____ERR____');
          setQueryIndicator(false);
        },
      );
    }
  };

  return (
    <Animated.ScrollView
      style={[
        styles.sliderAdminMenu,
        {
          transform: [{translateX: streamScheduleValue}, {perspective: 1000}],
        },
      ]}>
      <SafeAreaView style={{flex: 1}}>
        <AdminHeader
          cancel
          ready
          navigation={navigation}
          moveOut={moveOut}
          who={streamScheduleValue}
        />

        <Text style={styles.headerAdminTitle}>График трансляций</Text>
        {EN_SHORT_DAY_OF_WEEK.map((el, i) => {
          let oneDay = SetNewTimeObject(
            data.place.streams[0] ? data.place.streams[0].schedules : [],
          )[el.day];

          return (
            <View
              key={i}
              style={[
                styles.graphRow,
                i === 6 && {
                  borderBottomColor: '#e3e3e3',
                  borderBottomWidth: 2,
                },
              ]}>
              <Text
                style={[
                  styles.graphDay,
                  numberDayNow === i && {color: '#e32a6c'},
                ]}>
                {EN_SHORT_TO_RU_SHORT[el.day]}
                {oneDay &&
                  oneDay.start_time &&
                  (oneDay.start_time.split(':')[0] * 3600 +
                    oneDay.start_time.split(':')[1] * 60 <=
                  oneDay.end_time.split(':')[0] * 3600 +
                    oneDay.end_time.split(':')[1] * 60
                    ? ''
                    : `-${SHORT_DAY_OF_WEEK[tomorrowFromDay(i)]}`)}
              </Text>
              <TouchableOpacity
                style={styles.graphTime}
                onPress={() => {
                  if (!data.place.streams[0]) {
                    Alert.alert('Оповещение', 'Стрим еще не создан');
                  } else {
                    setSelectedDay(oneDay);
                    setEnumWeekName(el.day);
                    setPopupVisible(true);
                  }
                }}>
                <Text
                  style={[
                    styles.graphTimeText,
                    numberDayNow === i && {fontWeight: 'bold'},
                  ]}>
                  {oneDay && oneDay.id
                    ? oneDay.start_time + '-' + oneDay.end_time
                    : '-'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.graphDayOf}
                onPress={() => {
                  if (!data.place.streams[0]) {
                    Alert.alert('Оповещение', 'Стрим еще не создан');
                  } else {
                    setAsDayOf(oneDay);
                  }
                }}>
                {oneDay && oneDay.id && <Text style={styles.onOff}>Откл</Text>}
              </TouchableOpacity>
            </View>
          );
        })}
      </SafeAreaView>

      <Dialog
        visible={popupVisible}
        onTouchOutside={() => setPopupVisible(false)}
        dialogAnimation={
          new ScaleAnimation({
            initialValue: 0,
            useNativeDriver: true,
          })
        }>
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            timeZoneOffsetInMinutes={0}
            value={date}
            mode={mode}
            is24Hour={true}
            display="spinner"
            onChange={onChangeTime}
          />
        )}
        <DialogContent>
          {selectedDay && (
            <View style={styles.dialogContent}>
              <View style={styles.dialogContentDays}>
                <Text>{EN_SHORT_TO_RU_SHORT[enumWeekName]}</Text>

                {selectedDay.start_time ? (
                  selectedDay.start_time.split(':')[0] * 3600 +
                    selectedDay.start_time.split(':')[1] * 60 <=
                  selectedDay.end_time.split(':')[0] * 3600 +
                    selectedDay.end_time.split(':')[1] * 60 ? (
                    <Text>{EN_SHORT_TO_RU_SHORT[enumWeekName]}</Text>
                  ) : (
                    <Text>
                      {
                        SHORT_DAY_OF_WEEK[
                          tomorrowFromDay(EN_SHORT_TO_NUMBER[enumWeekName])
                        ]
                      }
                    </Text>
                  )
                ) : (
                  <Text>{EN_SHORT_TO_RU_SHORT[enumWeekName]}</Text>
                )}
              </View>
              <View style={styles.dialogTimeBlockWrap}>
                <TouchableOpacity
                  style={styles.dialogTimeBlock}
                  onPress={() => {
                    setIsPickStartTime(true);
                    showTimepicker();
                  }}>
                  <Text>
                    {pickedStartTime || selectedDay.start_time || '-'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.space} />
                <TouchableOpacity
                  style={styles.dialogTimeBlock}
                  onPress={() => {
                    setIsPickStartTime(false);
                    showTimepicker();
                  }}>
                  <Text>{pickedEndTime || selectedDay.end_time || '-'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => saveStreamTime()}>
                <Text style={styles.saveBtnText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          )}
        </DialogContent>
      </Dialog>

      {queryIndicator && <QueryIndicator />}
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
  graphRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#e3e3e3',
    marginBottom: -1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphDay: {
    textAlign: 'center',
    flex: 1,
    padding: 5,
    fontSize: 16,
  },
  graphTime: {
    padding: 5,
    flex: 3,
  },
  graphTimeText: {
    textAlign: 'center',
    fontSize: 18,
  },
  graphDayOf: {
    padding: 5,
    flex: 1,
    borderRightColor: '#e3e3e3',
    borderRightWidth: 1,
  },
  onOff: {
    fontSize: 16,
  },
  dialogContent: {
    width: Dimensions.get('window').width * 0.8,
  },
  dialogContentDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  dialogTimeBlockWrap: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dialogTimeBlock: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 5,
    padding: 5,
    marginTop: 20,
    flex: 1,
  },
  space: {
    width: 10,
  },
  saveBtn: {
    backgroundColor: '#e32a6c',
    color: '#fff',
    width: '100%',
    textAlign: 'center',
    padding: 8,
    borderRadius: 5,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 15,
  },
  saveBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default StreamSchedule;
