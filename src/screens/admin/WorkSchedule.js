import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  StatusBar,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useMutation} from 'react-apollo';
import Dialog, {ScaleAnimation, DialogContent} from 'react-native-popup-dialog';
import DateTimePicker from '@react-native-community/datetimepicker';

import AdminHeader from './AdminHeader';
import {numberDayNow} from '../../calculateTime';
import {
  GET_PLACE,
  DELETE_SCHEDULE,
  CREATE_WORK_TIME,
  UPDATE_WORK_SCHEDULE,
} from '../../QUERYES';
import {
  EN_SHORT_DAY_OF_WEEK,
  EN_SHORT_TO_RU_SHORT,
  SHORT_DAY_OF_WEEK,
  EN_SHORT_TO_NUMBER,
} from '../../constants';

const WorkSchedule = ({
  workScheduleValue,
  navigation,
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

  const [enumWeekName, setEnumWeekName] = useState(''),
    [popupVisible, setPopupVisible] = useState(false),
    [show, setShow] = useState(false),
    [selectedDay, setSelectedDay] = useState(false),
    [pickedStartTime, setPickedStartTime] = useState(''),
    [pickedEndTime, setPickedEndTime] = useState(''),
    [isPickStartTime, setIsPickStartTime] = useState(false),
    [date, setDate] = useState(new Date()),
    [mode, setMode] = useState('date');

  const [DELETE_SCHEDULE_mutation] = useMutation(
      DELETE_SCHEDULE,
      refreshObject,
    ),
    [CREATE_WORK_TIME_mutation] = useMutation(CREATE_WORK_TIME, refreshObject),
    [UPDATE_WORK_SCHEDULE_mutation] = useMutation(
      UPDATE_WORK_SCHEDULE,
      refreshObject,
    );

  const setAsDayOf = (day) => {
    if (day.id) {
      DELETE_SCHEDULE_mutation({
        variables: {
          id: day.id,
        },
        optimisticResponse: null,
      });
    }
  };

  const onChangeTime = (event, selectedTime) => {
    const currentDate = selectedTime || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);

    const hours = selectedTime.getHours(),
      minutes = selectedTime.getMinutes(),
      time =
        '' +
        (hours > 9 ? hours : '0' + hours) +
        ':' +
        (minutes > 9 ? minutes : '0' + minutes);

    isPickStartTime ? setPickedStartTime(time) : setPickedEndTime(time);
  };

  const showTimepicker = () => {
    setShow(true);
    setMode('time');
  };

  const saveWorkTime = () => {
    if (!selectedDay.id) {
      if (pickedStartTime && pickedEndTime) {
        setPopupVisible(false);

        CREATE_WORK_TIME_mutation({
          variables: {
            id: navigation.state.params.item.id,
            day: enumWeekName,
            start_time: pickedStartTime,
            end_time: pickedEndTime,
          },
          optimisticResponse: null,
        });
      }
    } else {
      if ((pickedStartTime && pickedEndTime) || selectedDay.start_time) {
        setPopupVisible(false);

        UPDATE_WORK_SCHEDULE_mutation({
          variables: {
            id: selectedDay.id,
            start_time: pickedStartTime || selectedDay.start_time,
            end_time: pickedEndTime || selectedDay.end_time,
          },
          optimisticResponse: null,
        }).then(
          (res) => console.log(res, 'RES'),
          (err) => console.log(err, 'ERR'),
        );
      }
    }
  };

  return (
    <Animated.ScrollView
      style={[
        styles.sliderAdminMenu,
        {transform: [{translateX: workScheduleValue}, {perspective: 1000}]},
      ]}>
      <SafeAreaView style={{flex: 1}}>
        <AdminHeader
          cancel
          ready
          navigation={navigation}
          moveOut={moveOut}
          who={workScheduleValue}
        />
        <Text style={styles.headerAdminTitle}>График работы</Text>
        {EN_SHORT_DAY_OF_WEEK.map((el, i) => {
          let oneDay = SetNewTimeObject(data.place.schedules)[el.day];
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
                  setSelectedDay(oneDay);
                  setEnumWeekName(el.day);
                  setPopupVisible(true);
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
                onPress={() => setAsDayOf(oneDay)}>
                {oneDay && oneDay.id && <Text style={styles.onOff}>Вых</Text>}
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
                onPress={() => saveWorkTime()}>
                <Text style={styles.saveBtnText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          )}
        </DialogContent>
      </Dialog>
    </Animated.ScrollView>
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

export default WorkSchedule;
