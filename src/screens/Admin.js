import React, {useState, useEffect, useRef} from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  Image,
  TextInput,
  ActivityIndicator,
  Switch,
  Animated,
  PermissionsAndroid,
} from 'react-native';
import {NodeCameraView} from 'react-native-nodemediaclient';

import Dialog, {ScaleAnimation, DialogContent} from 'react-native-popup-dialog';
import VideoPlayer from 'react-native-video-controls';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Query, useMutation, useQuery} from 'react-apollo';

import {
  EN_SHORT_DAY_OF_WEEK,
  EN_SHORT_TO_RU_SHORT,
  SHORT_DAY_OF_WEEK,
  EN_SHORT_TO_NUMBER,
} from '../constants';
import Header from '../components/Header';
import {
  GET_PLACE,
  CREATE_WORK_TIME,
  UPDATE_WORK_SCHEDULE,
  UPDATE_PLACE_DATA,
  DELETE_SCHEDULE,
  UPDATE_STREAMS_SCHEDULE,
  CREATE_STREAMS_SCHEDULE,
  GET_CATEGORIES,
  UPDATE_IMAGE,
} from '../QUERYES';

const Admin = (props) => {
  const {streams} = props.navigation.state.params.item;

  const [popupVisible, setPopupVisible] = useState(false);
  const [date, setDate] = useState(new Date().getTime());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [selectedDay, setSelectedDay] = useState(false);
  const [isPickStartTime, setIsPickStartTime] = useState(false);
  const [pickedStartTime, setPickedStartTime] = useState('');
  const [pickedEndTime, setPickedEndTime] = useState('');
  const [enumWeekName, setEnumWeekName] = useState('');
  const [isClickedWorkTime, setIsClickedWorkTime] = useState(false);
  const [pickerImageMime, setpPickerImageMime] = useState('');
  const [pickerImageData, setpPickerImageData] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputPseudonim, setInputPseudonim] = useState('');
  const [inputDescription, setInputDescription] = useState(
    data && data.place && data.place.description && data.place.description,
  );
  const [typeOfCompany, setTypeOfCompany] = useState('');
  const [typeOfCompanyId, setTypeOfCompanyId] = useState('');
  const [isStreamOff, setIsStreamOff] = useState(false);

  const videoRef = useRef(null);

  const decriptionLengthLimit = 300;

  useEffect(() => {
    setPickedStartTime('');
    setPickedEndTime('');
  }, [popupVisible]);

  useEffect(() => {
    data &&
      data.place &&
      data.place.description &&
      setInputDescription(data.place.description);
  }, []);

  const {loading, error, data, refetch} = useQuery(GET_PLACE, {
    variables: {id: props.navigation.state.params.item.id},
  });

  const [CREATE_WORK_TIME_mutation] = useMutation(CREATE_WORK_TIME);
  const [UPDATE_WORK_SCHEDULE_mutation] = useMutation(UPDATE_WORK_SCHEDULE);
  const [DELETE_SCHEDULE_mutation] = useMutation(DELETE_SCHEDULE);
  const [UPDATE_STREAMS_SCHEDULE_mutation] = useMutation(
    UPDATE_STREAMS_SCHEDULE,
  );
  const [CREATE_STREAMS_SCHEDULE_mutation] = useMutation(
    CREATE_STREAMS_SCHEDULE,
  );
  const [UPDATE_PLACE_DATA_mutation] = useMutation(UPDATE_PLACE_DATA);
  const [UPDATE_IMAGE_mutation] = useMutation(UPDATE_IMAGE);

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

  const setAsDayOf = (day) => {
    if (day.id) {
      DELETE_SCHEDULE_mutation({
        variables: {
          id: day.id,
        },
        optimisticResponse: null,
      });
      setTimeout(() => refetch(), 300);
    }
  };

  const saveWorkTime = () => {
    if (!selectedDay.id) {
      if (pickedStartTime && pickedEndTime) {
        setPopupVisible(false);
        CREATE_WORK_TIME_mutation({
          variables: {
            id: props.navigation.state.params.item.id,
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

  const saveStreamTime = () => {
    if (!selectedDay.id) {
      if (pickedStartTime && pickedEndTime) {
        setPopupVisible(false);

        CREATE_STREAMS_SCHEDULE_mutation({
          variables: {
            id: data.place.streams[0].id,
            day: enumWeekName,
            start_time: pickedStartTime,
            end_time: pickedEndTime,
          },
          optimisticResponse: null,
        }).then(
          (res) => console.log(res, 'RES'),
          (err) => console.log(err, 'ERR'),
        );
      }
    } else {
      if ((pickedStartTime && pickedEndTime) || selectedDay.start_time) {
        setPopupVisible(false);

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
          (res) => console.log(res, 'RES'),
          (err) => console.log(err, 'ERR'),
        );
      }
    }
  };

  const onChangeTime = (event, selectedTime) => {
    const currentDate = selectedTime || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);

    const time =
      '' +
      (hours > 9 ? hours : '0' + hours) +
      ':' +
      (minutes > 9 ? minutes : '0' + minutes);

    const hours = selectedTime.getHours(),
      minutes = selectedTime.getMinutes();
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

  const goToPickImage = () => {
    ImagePicker.openPicker({
      width: 250,
      height: 250,
      cropping: true,
      includeBase64: true,
    })
      .then((image) => {
        const imgData = {
          uri: image.path,
          type: image.mime,
          name: 'photo.jpg',
        };
        var formData = new FormData();
        formData.append('image', imgData);

        UPDATE_IMAGE_mutation({
          variables: {
            file: imgData,
          },
          optimisticResponse: null,
        })
          .then((data) => console.log(data, '_____data'))
          .catch((err) => console.log(err, '______err'));
        setpPickerImageMime(image.mime);
        setpPickerImageData(image.data);
      })
      .catch((err) => console.log(err, ' ERR ERR'));
  };

  const saveNewData = () => {
    !typeOfCompanyId
      ? UPDATE_PLACE_DATA_mutation({
          variables: {
            id: data.place.id,
            name: inputName || data.place.name,
            description: inputDescription || data.place.description,
          },
          optimisticResponse: null,
        }).then(
          (res) => console.log(res, 'RES'),
          (err) => console.log(err, 'ERR'),
        )
      : UPDATE_PLACE_DATA_mutation({
          variables: {
            id: data.place.id,
            name: inputName || data.place.name,
            description: inputDescription || data.place.description,
            categories: {
              disconnect: data.place.categories[0].id,
              connect: typeOfCompanyId,
            },
          },
          optimisticResponse: null,
        }).then(
          (res) => console.log(res, 'RES'),
          (err) => console.log(err, 'ERR'),
        );
  };

  const tomorrowFromDay = (day) => {
    if (day === 6) {
      return 0;
    } else {
      return day + 1;
    }
  };

  const streamValue = useState(
    new Animated.Value(-Dimensions.get('window').width),
  )[0];
  const profileValue = useState(
    new Animated.Value(-Dimensions.get('window').width),
  )[0];
  const workScheduleValue = useState(
    new Animated.Value(-Dimensions.get('window').width),
  )[0];
  const streamScheduleValue = useState(
    new Animated.Value(-Dimensions.get('window').width),
  )[0];
  const translationValue = useState(
    new Animated.Value(-Dimensions.get('window').width),
  )[0];

  const moveIn = (data) => {
    Animated.timing(data, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const moveOut = (data) => {
    Animated.timing(data, {
      toValue: -Dimensions.get('window').width,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const vbRef = useRef(null);
  const [publishBtnTitle, setPublishBtnTitle] = useState('Начать трансляцию');
  const [isPublish, setIsPublish] = useState(false);

  // const requestCameraPermission = async () => {
  //   try {
  //     const granted = await PermissionsAndroid.requestMultiple(
  //       [
  //         PermissionsAndroid.PERMISSIONS.CAMERA,
  //         PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  //       ],
  //       {
  //         title: 'Cool Photo App Camera And Microphone Permission',
  //         message:
  //           'Cool Photo App needs access to your camera ' +
  //           'so you can take awesome pictures.',
  //         buttonNeutral: 'Ask Me Later',
  //         buttonNegative: 'Cancel',
  //         buttonPositive: 'OK',
  //       },
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       console.log('You can use the camera');
  //     } else {
  //       console.log('Camera permission denied');
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // };

  if (loading) {
    return <Text>'Loading...'</Text>;
  }
  if (error) {
    return <Text>`Error! ${error.message}`</Text>;
  }
  return (
    <View style={styles.Admin}>
      <Header props={props} />
      <View style={styles.AdminInner}>
        <TouchableOpacity onPress={() => moveIn(streamValue)}>
          <Text>Стрим</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => moveIn(profileValue)}>
          <Text>Профиль заведения</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => moveIn(workScheduleValue)}>
          <Text>График работы</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => moveIn(streamScheduleValue)}>
          <Text>График стримов</Text>
        </TouchableOpacity>
        <View>
          <TouchableOpacity onPress={() => moveIn(translationValue)}>
            <Text>Трансляции</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Animated.ScrollView
        style={[styles.sliderAdminMenu, {translateX: streamValue}]}>
        <TouchableOpacity
          onPress={() => {
            moveOut(streamValue);
            !videoRef.current.state.paused &&
              videoRef.current.methods.togglePlayPause();
          }}>
          <Text>{'<'} ВЕРНУТЬСЯ</Text>
        </TouchableOpacity>
        <Text style={styles.headerAdminTitle}>Стрим</Text>
        <View style={styles.videoWrap}>
          <VideoPlayer
            ref={videoRef}
            poster={streams[0].preview}
            paused={true}
            source={{uri: streams[0].url}}
            disableSeekbar
            disableTimer
            disableBack
            disableFullscreen
            toggleResizeModeOnFullscreen={false}
          />
        </View>
      </Animated.ScrollView>

      <Animated.ScrollView
        style={[styles.sliderAdminMenu, {translateX: profileValue}]}>
        <TouchableOpacity onPress={() => moveOut(profileValue)}>
          <Text>{'<'} ВЕРНУТЬСЯ</Text>
        </TouchableOpacity>
        <View style={styles.profileWrap}>
          <Text style={styles.headerAdminTitle}>Профиль заведения</Text>
          <View>
            {pickerImageMime && pickerImageData ? (
              <Image
                style={styles.pickerImageStyle}
                source={{
                  uri: `data:${pickerImageMime};base64,${pickerImageData}`,
                }}
              />
            ) : (
              <View style={styles.noPickerImageStyle}>
                <Text
                  style={styles.noPickerImageText}
                  onPress={() => goToPickImage()}>
                  Загрузить фото
                </Text>
                <Text style={styles.noPickerImageText}>250 X 250</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.imageUploader}
              onPress={() => goToPickImage()}>
              <Text style={styles.changePhotoText}>Сменить фото профиля</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.streamOffMainWrap}>
            <View style={styles.streamOffWrap}>
              <Text style={styles.streamOffMainText}>Отключить стрим</Text>
              <Text style={styles.streamOffText}>
                Выключается до следующего дня
              </Text>
            </View>
            <Switch
              trackColor={{false: '#aeaeae', true: '#e32a6c'}}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsStreamOff}
              value={isStreamOff}
            />
          </View>
          <View style={styles.textInputWrap}>
            <Text style={styles.textInputTitleText}>Название заведения:</Text>
            <TextInput
              style={styles.textInputStyle}
              onChangeText={(text) => setInputName(text)}
              value={inputName}
              placeholder={data.place.name}
            />
          </View>
          <View style={styles.textInputWrap}>
            <Text style={styles.textInputTitleText}>Псевдоним:</Text>
            <TextInput
              style={styles.textInputStyle}
              onChangeText={(text) => setInputPseudonim(text)}
              value={inputPseudonim}
              placeholder={data.place.name}
            />
          </View>
          <View style={styles.textInputWrap}>
            <Text style={styles.textInputTitleText}>Категория:</Text>
            <View style={styles.btnCategoryWrap}>
              <Query query={GET_CATEGORIES}>
                {(prop) => {
                  if (prop.loading) {
                    return (
                      <View>
                        <ActivityIndicator size="large" color="#0000ff" />
                      </View>
                    );
                  }
                  if (prop.error) {
                    return <Text>Error! ${prop.error.message}</Text>;
                  }
                  return prop.data.categories.map((el, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.btnCategory,
                        typeOfCompany && typeOfCompany === el.name
                          ? styles.bacgrBtn
                          : !typeOfCompany &&
                            el.name &&
                            data.place.categories &&
                            data.place.categories[0] &&
                            data.place.categories[0].name === el.name
                          ? styles.bacgrBtn
                          : {},
                      ]}
                      onPress={() => {
                        setTypeOfCompany(el.name);
                        setTypeOfCompanyId(el.id);
                      }}>
                      <Text
                        style={
                          (styles.btnCategory,
                          typeOfCompany && typeOfCompany === el.name
                            ? {
                                color: '#fff',
                              }
                            : !typeOfCompany &&
                              el.name &&
                              data.place.categories &&
                              data.place.categories[0] &&
                              data.place.categories[0].name === el.name
                            ? {
                                color: '#fff',
                              }
                            : {})
                        }>
                        {el.name}
                      </Text>
                    </TouchableOpacity>
                  ));
                }}
              </Query>
            </View>
          </View>
          <View style={styles.textInputWrap}>
            <Text style={styles.textInputTitleText}>Адрес заведения:</Text>
            <TextInput
              style={styles.textInputStyle}
              value={data.place.address}
              contextMenuHidden={true}
              editable={false}
            />
            <TouchableOpacity style={styles.pinkBtn} onPress={() => {}}>
              <Text style={styles.pinkBtnText}>ВЫБРАТЬ АДРЕС НА КАРТЕ</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.textInputWrap}>
            <Text style={styles.textInputTitleText}>Описание:</Text>
            <Text
              style={[
                styles.textDescLimit,
                inputDescription
                  ? inputDescription.length === decriptionLengthLimit
                    ? {color: 'red'}
                    : {color: 'green'}
                  : data.place.description.length === decriptionLengthLimit
                  ? {color: 'red'}
                  : {color: 'green'},
              ]}>
              {inputDescription
                ? inputDescription.length
                : data.place.description.length}
              / {decriptionLengthLimit}
            </Text>
            <TextInput
              maxLength={decriptionLengthLimit}
              multiline={true}
              style={styles.textInputMultilineStyle}
              onChangeText={(text) => setInputDescription(text)}
              value={inputDescription}
            />
          </View>
          <TouchableOpacity
            style={styles.pinkBtn}
            onPress={() => saveNewData()}>
            <Text style={styles.pinkBtnText}>СОХРАНИТЬ</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      <Animated.ScrollView
        style={[styles.sliderAdminMenu, {translateX: workScheduleValue}]}>
        <TouchableOpacity onPress={() => moveOut(workScheduleValue)}>
          <Text>{'<'} ВЕРНУТЬСЯ</Text>
        </TouchableOpacity>
        <Text style={styles.headerAdminTitle}>График работы</Text>
        {EN_SHORT_DAY_OF_WEEK.map((el, i) => {
          let oneDay = SetNewTimeObject(data.place.schedules)[el.day];
          return (
            <View key={i} style={styles.graphRow}>
              <Text style={styles.graphDay}>
                {EN_SHORT_TO_RU_SHORT[el.day]}
                {oneDay.start_time &&
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
                  setIsClickedWorkTime(true);
                }}>
                <Text style={styles.graphTimeText}>
                  {oneDay && oneDay.id
                    ? oneDay.start_time + '-' + oneDay.end_time
                    : '-'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.graphDayOf}
                onPress={() => setAsDayOf(oneDay)}>
                <Text style={styles.graphTimeText}>Вых</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </Animated.ScrollView>

      <Animated.ScrollView
        style={[styles.sliderAdminMenu, {translateX: streamScheduleValue}]}>
        <TouchableOpacity onPress={() => moveOut(streamScheduleValue)}>
          <Text>{'<'} ВЕРНУТЬСЯ</Text>
        </TouchableOpacity>
        <Text style={styles.headerAdminTitle}>График трансляций</Text>
        {EN_SHORT_DAY_OF_WEEK.map((el, i) => {
          let oneDay = SetNewTimeObject(
            data.place.streams[0] ? data.place.streams[0].schedules : [],
          )[el.day];

          return (
            <View key={i} style={styles.graphRow}>
              <Text style={styles.graphDay}>
                {EN_SHORT_TO_RU_SHORT[el.day]}
                {oneDay.start_time &&
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
                    setIsClickedWorkTime(false);
                  }
                }}>
                <Text style={styles.graphTimeText}>
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
                <Text style={styles.graphTimeText}>Откл</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </Animated.ScrollView>

      <Animated.ScrollView
        style={[styles.sliderAdminMenu, {translateX: translationValue}]}>
        <TouchableOpacity onPress={() => moveOut(translationValue)}>
          <Text>{'<'} ВЕРНУТЬСЯ</Text>
        </TouchableOpacity>
        <Text style={styles.headerAdminTitle}>ТРАНСЛЯЦИЯ</Text>
        <NodeCameraView
          style={styles.nodeCameraStyle}
          ref={vbRef}
          outputUrl={'rtmp://194.87.235.18/streaming/123'}
          camera={{cameraId: 1, cameraFrontMirror: true}}
          audio={{bitrate: 60000, profile: 1, samplerate: 44100}}
          video={{
            preset: 12,
            bitrate: 300000,
            profile: 1,
            fps: 15,
            videoFrontMirror: false,
          }}
          autopreview={true}
        />
        {/* <TouchableOpacity
          style={{backgroundColor: 'gold'}}
          onPress={requestCameraPermission}>
          <Text>Запрос на сьемку</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity
          style={{height: 50}}
          onPress={() => {
            vbRef.current.switchCamera();
          }}>
          <Text>SWITCH CAMERA</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => {
            if (isPublish) {
              setPublishBtnTitle('Начать трансляцию');
              setIsPublish(false);
              vbRef.current.stop();
            } else {
              setPublishBtnTitle('Остановить трансляцию');
              setIsPublish(true);
              vbRef.current.start();
            }
          }}>
          <Text
            style={[
              styles.startTranslBtn,
              isPublish
                ? styles.startTranslBtnClicked
                : styles.startTranslBtnNotClicked,
            ]}>
            {publishBtnTitle}
          </Text>
        </TouchableOpacity>
      </Animated.ScrollView>

      <Dialog
        visible={popupVisible}
        onTouchOutside={() => setPopupVisible(false)}
        dialogAnimation={
          new ScaleAnimation({
            initialValue: 0,
            useNativeDriver: true,
          })
        }>
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
                onPress={() => {
                  if (isClickedWorkTime) {
                    saveWorkTime();
                  } else {
                    saveStreamTime();
                  }
                  setTimeout(() => refetch(), 500);
                }}>
                <Text style={styles.saveBtnText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          )}
        </DialogContent>
      </Dialog>
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
    </View>
  );
};

const styles = StyleSheet.create({
  Admin: {
    height: Dimensions.get('window').height,
    flex: 1,
  },
  AdminInner: {
    flex: 1,
  },
  sliderAdminMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    width: '100%',
    translateX: -Dimensions.get('window').width,
    flex: 1,
  },
  profileWrap: {
    padding: 20,
  },
  headerAdminTitle: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
  },
  nodeCameraStyle: {
    height: 173,
    width: '100%',
  },
  startTranslBtn: {
    height: 50,
    width: 279,
    alignSelf: 'center',
    marginTop: 35,
    lineHeight: 50,
    textAlign: 'center',
    textTransform: 'uppercase',
    borderRadius: 15,
    fontWeight: 'bold',
    fontSize: 18,
  },
  startTranslBtnClicked: {
    borderWidth: 2,
    borderColor: '#909090',
    color: '#999',
  },
  startTranslBtnNotClicked: {
    backgroundColor: '#E32A6C',
    color: '#fff',
  },
  videoWrap: {
    height: 250,
  },

  tableHeader: {
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    padding: 10,
  },
  tableBody: {
    padding: 10,
  },
  imageUploader: {
    alignSelf: 'center',
    paddingTop: 10,
  },
  noPickerImageStyle: {
    alignSelf: 'center',
    width: 125,
    height: 125,
    backgroundColor: '#f2f2f7',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#e32a6c',
  },
  noPickerImageText: {
    color: '#aeaeae',
  },
  pickerImageStyle: {
    width: 125,
    height: 125,
    alignSelf: 'center',
    borderRadius: 5,
  },
  streamOffMainWrap: {
    flexDirection: 'row',
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streamOffMainText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  streamOffText: {
    fontSize: 16,
    color: '#999',
  },
  textInputWrap: {
    marginVertical: 20,
  },
  textInputTitleText: {
    fontSize: 16,
    color: '#4F4F4F',
  },
  textDescLimit: {
    textAlign: 'right',
    fontSize: 12,
  },
  textInputStyle: {
    borderBottomColor: '#999',
    borderBottomWidth: 1,
  },
  btnCategoryWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  btnCategory: {
    borderColor: '#C4C4C4',
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 35,
  },
  textInputMultilineStyle: {
    borderBottomColor: '#999',
    borderBottomWidth: 1,
  },
  pinkBtn: {
    backgroundColor: '#E32A6C',
    borderRadius: 5,
    height: 36,
    width: 244,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  pinkBtnText: {
    color: '#fff',
  },
  graphRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e3e3e3',
    marginBottom: -1,
  },
  graphDay: {
    borderColor: '#e3e3e3',
    borderRightWidth: 1,
    textAlign: 'center',
    flex: 1,
    padding: 5,
  },
  graphTime: {
    padding: 5,
    flex: 3,
    borderRightWidth: 1,
    borderRightColor: '#e3e3e3',
  },
  graphTimeText: {
    textAlign: 'center',
  },
  dayOfBtn: {
    color: '#e32a6c',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 18,
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
  graphDayOf: {
    padding: 5,
    flex: 1,
    borderRightColor: '#e3e3e3',
    borderRightWidth: 1,
  },
  graphSave: {
    padding: 5,
    flex: 2,
  },
  graphSaveText: {
    color: 'green',
  },
  bacgrBtn: {
    backgroundColor: '#e32a6c',
  },
});

export default Admin;
