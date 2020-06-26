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
  SafeAreaView,
} from 'react-native';
import {getToken} from '../util';
import {NodeCameraView} from 'react-native-nodemediaclient';
import axios from 'axios';
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
import {numberDayNow} from '../calculateTime.js';
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
  UPDATE_SEE_YOU_TOMORROW,
  UPDATE_STREAM,
  CREATE_STREAM,
  SAVE_ADDRESS,
} from '../QUERYES';
import GoogleMap from '../components/GoogleMap';

const AdminHeader = ({
  cancel,
  ready,
  moveOut,
  who,
  videoPause,
  navigation,
  saveFunction,
  cancelFunction,
}) => {
  return (
    <View style={headerStyles.header}>
      <TouchableOpacity
        onPress={() => {
          moveOut(who);
          videoPause && videoPause();
          cancelFunction && cancelFunction();
        }}>
        {!cancel ? (
          <Image
            style={headerStyles.goBack}
            source={require('../img/arrow.png')}
          />
        ) : (
          <Text style={headerStyles.headerBtn}>Отмена</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <View style={headerStyles.PLLogo}>
          <Text style={headerStyles.party}>PARTY</Text>
          <View style={headerStyles.partyWrap}>
            <Text style={headerStyles.live}>.LIVE</Text>
          </View>
        </View>
      </TouchableOpacity>
      {!ready ? (
        <TouchableOpacity
          style={headerStyles.burgerWrap}
          onPress={() => navigation.openDrawer()}>
          <View style={headerStyles.burgerOne} />
          <View style={headerStyles.burgerOne} />
          <View style={headerStyles.burgerOne} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => {
            moveOut(who);
            videoPause && videoPause();
            saveFunction && saveFunction();
          }}>
          <Text style={headerStyles.headerBtn}>Готово</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const headerStyles = StyleSheet.create({
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
  const [inputCameraAddress, setInputCameraAddress] = useState('');
  const [inputAlias, setInputAlias] = useState('');
  const [inputDescription, setInputDescription] = useState(
    data && data.place && data.place.description && data.place.description,
  );
  const [typeOfCompany, setTypeOfCompany] = useState('');
  const [typeOfCompanyId, setTypeOfCompanyId] = useState('');
  const [isStreamOff, setIsStreamOff] = useState(false);

  const [ADDRESS, setADDRESS] = useState(null);
  const [COORD, setCOORD] = useState(null);

  const windowWidth = Dimensions.get('window').width;

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

    data && data.place && data.place.alias && setInputAlias(data.place.alias);
    data && data.place && data.place.name && setInputName(data.place.name);
  }, []);

  const dateNow = new Date()
    .toLocaleDateString()
    .split('.')
    .reverse()
    .join('-');

  useEffect(() => {
    data &&
      data.place &&
      data.place.streams &&
      data.place.streams[0] &&
      data.place.streams[0].see_you_tomorrow &&
      setIsStreamOff(data.place.streams[0].see_you_tomorrow === dateNow);
  }, [data, dateNow]);

  const {loading, error, data} = useQuery(GET_PLACE, {
    variables: {id: props.navigation.state.params.item.id},
  });

  const refreshObject = {
    refetchQueries: [
      {
        query: GET_PLACE,
        variables: {id: props.navigation.state.params.item.id},
      },
    ],
    awaitRefetchQueries: true,
  };

  const [CREATE_WORK_TIME_mutation] = useMutation(
    CREATE_WORK_TIME,
    refreshObject,
  );
  const [UPDATE_WORK_SCHEDULE_mutation] = useMutation(
    UPDATE_WORK_SCHEDULE,
    refreshObject,
  );
  const [DELETE_SCHEDULE_mutation] = useMutation(
    DELETE_SCHEDULE,
    refreshObject,
  );
  const [UPDATE_STREAMS_SCHEDULE_mutation] = useMutation(
    UPDATE_STREAMS_SCHEDULE,
    refreshObject,
  );
  const [CREATE_STREAMS_SCHEDULE_mutation] = useMutation(
    CREATE_STREAMS_SCHEDULE,
    refreshObject,
  );
  const [UPDATE_PLACE_DATA_mutation] = useMutation(
    UPDATE_PLACE_DATA,
    refreshObject,
  );
  const [UPDATE_IMAGE_mutation] = useMutation(UPDATE_IMAGE, refreshObject);
  const [SAVE_ADDRESS_mutation] = useMutation(SAVE_ADDRESS, refreshObject);
  const [UPDATE_SEE_YOU_TOMORROW_mutation] = useMutation(
    UPDATE_SEE_YOU_TOMORROW,
    refreshObject,
  );

  const [UPDATE_STREAM_mutation] = useMutation(UPDATE_STREAM, refreshObject);
  const [CREATE_STREAM_mutation] = useMutation(CREATE_STREAM, refreshObject);

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

  const goToPickImage = () => {
    ImagePicker.openPicker({
      width: windowWidth - 50,
      height: (windowWidth - 50) * 0.65,
      cropping: true,
      includeBase64: true,
    })
      .then((image) => {
        fetch(image.path)
          .then((res) => res.blob())
          .then((blob) => {
            console.log(blob, 'blob');

            const getAsyncToken = async () => {
              const token = await getToken();
              return token;
            };

            getAsyncToken().then((token) => {
              const query = `
                  mutation ($file: Upload!) {
                    placeImage(file: $file)
                  }
                `;
              const data = {
                file: null,
              };
              const operations = JSON.stringify({
                query,
                variables: {
                  data,
                },
              });
              let formData = new FormData();
              formData.append('operations', operations);
              const map = {
                '0': ['variables.file'],
              };
              formData.append('map', JSON.stringify(map));
              formData.append('0', blob);

              axios({
                url: 'https://backend.partylive.by/graphql',
                method: 'POST',
                headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: 'Bearer ' + token,
                },
                data: blob,
              })
                .then(function (res) {
                  console.log(res, 'RESSSSSS');
                })
                .catch(function (err) {
                  console.log(err, ' ERR');
                });
            });
          })
          .catch((err) => console.log(err, 'ERR +++++'));

        setpPickerImageMime(image.mime);
        setpPickerImageData(image.data);
      })
      .catch((err) => console.log(err, ' ERR ERR'));
  };

  const saveNewData = () => {
    UPDATE_PLACE_DATA_mutation({
      variables: {
        id: data.place.id,
        name: inputName || data.place.name,
        alias: inputAlias || data.place.alias,
      },
      optimisticResponse: null,
    }).then(
      (res) => console.log(res, 'RES'),
      (err) => console.log(err, 'ERR'),
    );
  };

  const saveDescription = () => {
    UPDATE_PLACE_DATA_mutation({
      variables: {
        id: data.place.id,
        description: inputDescription || data.place.description,
      },
      optimisticResponse: null,
    }).then(
      (res) => console.log(res, 'desc RES'),
      (err) => console.log(err, 'desc ERR'),
    );
  };

  const disableStream = (see_you_tomorrow) => {
    if (data.place.streams[0]) {
      UPDATE_SEE_YOU_TOMORROW_mutation({
        variables: {
          id: data.place.streams[0].id,
          see_you_tomorrow: see_you_tomorrow,
        },
        optimisticResponse: null,
      })
        .then(
          (res) => console.log(res, 'RES__'),
          (err) => console.log(err, '___ERR___'),
        )
        .catch((err) => console.log(err, '______err_1'));
    }
  };

  const tomorrowFromDay = (day) => {
    if (day === 6) {
      return 0;
    } else {
      return day + 1;
    }
  };

  const streamValue = useState(new Animated.Value(-windowWidth))[0];
  const profileValue = useState(new Animated.Value(-windowWidth))[0];
  const workScheduleValue = useState(new Animated.Value(-windowWidth))[0];
  const streamScheduleValue = useState(new Animated.Value(-windowWidth))[0];
  const translationValue = useState(new Animated.Value(-300))[0];
  const chooseCategoryValue = useState(new Animated.Value(-windowWidth))[0];
  const descriptionValue = useState(new Animated.Value(-windowWidth))[0];
  const addressValue = useState(new Animated.Value(-windowWidth))[0];

  const moveIn = (data) => {
    Animated.timing(data, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const moveOut = (data) => {
    Animated.timing(data, {
      toValue: -300,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const vbRef = useRef(null);
  const [publishBtnTitle, setPublishBtnTitle] = useState('Начать трансляцию');
  const [isPublish, setIsPublish] = useState(false);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ],
        {
          title: 'Cool Photo App Camera And Microphone Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const videoPause = () => {
    !videoRef.current.state.paused &&
      videoRef.current.methods.togglePlayPause();
  };

  const updateStream = (inputCameraAddress) => {
    UPDATE_STREAM_mutation({
      variables: {
        id: data.place.streams[0].id,
        url: `https://partycamera.org/${inputCameraAddress}/index.m3u8`,
        preview: `http://partycamera.org/${inputCameraAddress}/preview.jpg`,
      },
      optimisticResponse: null,
    })
      .then(
        (res) => console.log(res, 'stream RES__'),
        (err) => console.log(err, 'stream ERR___'),
      )
      .catch((err) => console.log(err, '______err_1'));
  };

  const createStream = (inputCameraAddress) => {
    CREATE_STREAM_mutation({
      variables: {
        name: data.place.name,
        url: `https://partycamera.org/${inputCameraAddress}/index.m3u8`,
        preview: `http://partycamera.org/${inputCameraAddress}/preview.jpg`,
        place: {
          connect: '' + data.place.id,
        },
      },
      optimisticResponse: null,
    })
      .then(
        (res) => console.log(res, 'create stream RES__'),
        (err) => console.log(err, 'create stream ERR___'),
      )
      .catch((err) => console.log(err, '______err_1'));
  };

  const chooseCategory = () => {
    UPDATE_PLACE_DATA_mutation({
      variables: {
        id: data.place.id,
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

  const ADDRESSfromCOORD = (address, coord) => {
    setADDRESS(address);
    setCOORD(coord);
  };

  const saveNewAddress = () => {
    if (ADDRESS) {
      const coordinate = COORD.latitude + ',' + COORD.longitude;
      SAVE_ADDRESS_mutation({
        variables: {
          id: data.place.id,
          address: ADDRESS,
          coordinates: coordinate,
        },
        optimisticResponse: null,
      })
        .then(
          (res) => console.log(res, 'RES__'),
          (err) => console.log(err, '___ERR___'),
        )
        .catch((err) => console.log(err, '______err_1'));
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  if (error) {
    return <Text>`Error! ${error.message}`</Text>;
  }
  return (
    <View style={styles.Admin}>
      <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
        <Header props={props} />
        <View style={styles.AdminInner}>
          <TouchableOpacity
            style={styles.oneBlock}
            onPress={() => moveIn(streamValue)}>
            <Text style={styles.oneBlockText}>Стрим</Text>
            <Text style={styles.oneBlockArrow}>&#62;</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.oneBlock}
            onPress={() => moveIn(profileValue)}>
            <Text style={styles.oneBlockText}>Профиль заведения</Text>
            <Text style={styles.oneBlockArrow}>&#62;</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.oneBlock}
            onPress={() => moveIn(workScheduleValue)}>
            <Text style={styles.oneBlockText}>График работы</Text>
            <Text style={styles.oneBlockArrow}>&#62;</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.oneBlock}
            onPress={() => moveIn(streamScheduleValue)}>
            <Text style={styles.oneBlockText}>График стримов</Text>
            <Text style={styles.oneBlockArrow}>&#62;</Text>
          </TouchableOpacity>
          <View>
            <TouchableOpacity
              style={styles.oneBlock}
              onPress={() => moveIn(translationValue)}>
              <Text style={styles.oneBlockText}>Трансляции</Text>
              <Text style={styles.oneBlockArrow}>&#62;</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Animated.ScrollView
          style={[styles.sliderAdminMenu, {translateX: streamValue}]}>
          <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
            <AdminHeader
              cancel
              ready
              saveFunction={() => {
                disableStream(isStreamOff ? dateNow : null);
                if (inputCameraAddress) {
                  if (!data.place.streams[0]) {
                    createStream(inputCameraAddress);
                  } else {
                    updateStream(inputCameraAddress);
                  }
                }
              }}
              cancelFunction={() => {
                data &&
                data.place &&
                data.place.streams &&
                data.place.streams[0] &&
                data.place.streams[0].see_you_tomorrow
                  ? setIsStreamOff(data.place.streams[0].see_you_tomorrow)
                  : setIsStreamOff(false);
              }}
              navigation={props.navigation}
              moveOut={moveOut}
              who={streamValue}
              videoPause={videoPause}
            />
            <Text style={styles.headerAdminTitle}>Стрим</Text>
            <View style={styles.videoWrap}>
              <VideoPlayer
                ref={videoRef}
                poster={streams[0] && streams[0].preview}
                paused={true}
                source={{uri: streams[0] && streams[0].url}}
                disableSeekbar
                disableTimer
                disableBack
                disableFullscreen
                toggleResizeModeOnFullscreen={false}
              />
            </View>
            {data && data.place && data.place.streams && data.place.streams[0] && (
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
            )}

            <View style={styles.cameraAddress}>
              <Text>Адрес камеры:</Text>
              <TextInput
                style={styles.textInputStyle}
                onChangeText={(text) => setInputCameraAddress(text)}
                value={inputCameraAddress}
                placeholder={
                  (data.place.streams &&
                    data.place.streams[0] &&
                    data.place.streams[0].url) ||
                  'Введите адрес стрима'
                }
              />
            </View>
          </SafeAreaView>
        </Animated.ScrollView>

        <Animated.ScrollView
          style={[styles.sliderAdminMenu, {translateX: profileValue}]}>
          <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
            <AdminHeader
              navigation={props.navigation}
              moveOut={moveOut}
              who={profileValue}
            />
            <View style={styles.profileWrap}>
              <Text style={styles.headerAdminTitle}>Профиль заведения</Text>
              <View>
                {pickerImageMime && pickerImageData ? (
                  <>
                    <Image
                      style={styles.pickerImageStyle}
                      source={{
                        uri: `data:${pickerImageMime};base64,${pickerImageData}`,
                      }}
                    />
                    <View>
                      <TouchableOpacity onPress={() => goToPickImage()}>
                        <Text>Изменить</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {}}>
                        <Text>Удалить</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.noPickerImageStyle}
                    onPress={() => goToPickImage()}>
                    <Text style={styles.noPickerImageText}>Загрузить фото</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.textInputWrap}>
                <Text style={styles.textInputTitleText}>Название:</Text>
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
                  onChangeText={(text) => setInputAlias(text)}
                  value={inputAlias}
                  placeholder={data.place.alias}
                />
              </View>
              <View style={styles.textInputWrap}>
                <Text style={styles.textInputTitleText}>Категория:</Text>
                <View style={styles.btnCategoryWrap}>
                  <View style={styles.btnCategoryOuter}>
                    <Text style={styles.btnCategoryInner}>
                      {data.place.categories[0].name}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => moveIn(chooseCategoryValue)}>
                    <Text style={styles.chooseNewCategory}>Выбрать...</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.textInputWrap}>
                <Text style={styles.textInputTitleText}>Адрес:</Text>
                <TouchableOpacity
                  style={styles.addressText}
                  onPress={() => moveIn(addressValue)}>
                  {/* ######################################3 */}
                  <TextInput
                    style={styles.textInputStyle}
                    value={data.place.address}
                    contextMenuHidden={true}
                    editable={false}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.textInputWrap}>
                <View style={styles.textInputTitleText}>
                  <Text style={styles.textInputText}>Описание:</Text>
                </View>
                <TouchableOpacity
                  style={styles.textInputMultilineStyleWrap}
                  onPress={() => moveIn(descriptionValue)}>
                  <Text
                    style={styles.textInputMultilineStyle}
                    numberOfLines={2}>
                    {inputDescription}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.pinkBtn}
                onPress={() => saveNewData()}>
                <Text style={styles.pinkBtnText}>СОХРАНИТЬ</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.ScrollView>

        <Animated.ScrollView
          style={[styles.sliderAdminMenu, {translateX: chooseCategoryValue}]}>
          <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
            <AdminHeader
              cancel
              ready
              saveFunction={() => chooseCategory()}
              cancelFunction={() => {}}
              navigation={props.navigation}
              moveOut={moveOut}
              who={chooseCategoryValue}
            />
            <Text style={styles.headerAdminTitle}>Тип заведения</Text>
            <View style={styles.categoryBtnsRow}>
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
                        styles.btnCategoryOuter,
                        styles.btnCategoryInNewWindow,
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
                          typeOfCompany && typeOfCompany === el.name
                            ? {
                                color: '#fff',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                              }
                            : !typeOfCompany &&
                              el.name &&
                              data.place.categories &&
                              data.place.categories[0] &&
                              data.place.categories[0].name === el.name
                            ? {
                                color: '#fff',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                              }
                            : {
                                color: '#000',
                                textTransform: 'uppercase',

                                fontWeight: 'bold',
                              }
                        }>
                        {el.name}
                      </Text>
                    </TouchableOpacity>
                  ));
                }}
              </Query>
            </View>
          </SafeAreaView>
        </Animated.ScrollView>

        <Animated.ScrollView
          style={[styles.sliderAdminMenu, {translateX: descriptionValue}]}>
          <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
            <AdminHeader
              cancel
              ready
              saveFunction={() => saveDescription()}
              cancelFunction={() => {
                data && data.place && data.place.description
                  ? setInputDescription(data.place.description)
                  : setInputDescription('');
              }}
              navigation={props.navigation}
              moveOut={moveOut}
              who={descriptionValue}
            />
            <Text style={styles.headerAdminTitle}>Описание</Text>
            <TextInput
              maxLength={decriptionLengthLimit}
              multiline={true}
              style={styles.textInputDesc}
              onChangeText={(text) => setInputDescription(text)}
              value={inputDescription}
            />
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
          </SafeAreaView>
        </Animated.ScrollView>

        <Animated.ScrollView
          style={[styles.sliderAdminMenu, {translateX: addressValue}]}>
          <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
            <AdminHeader
              cancel
              ready
              saveFunction={() => saveNewAddress()}
              cancelFunction={() => {}}
              navigation={props.navigation}
              moveOut={moveOut}
              who={addressValue}
            />
            <View style={styles.mapWrap}>
              <GoogleMap
                onePlace={props.navigation.state.params.item}
                ADDRESSfromCOORD={(data, coord) =>
                  ADDRESSfromCOORD(data, coord)
                }
              />
              <Text style={styles.addressStyle}>
                {ADDRESS && ADDRESS.split(',')[0]}
              </Text>
            </View>
          </SafeAreaView>
        </Animated.ScrollView>

        <Animated.ScrollView
          style={[styles.sliderAdminMenu, {translateX: workScheduleValue}]}>
          <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
            <AdminHeader
              cancel
              ready
              navigation={props.navigation}
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
                      setIsClickedWorkTime(true);
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
                    {oneDay && oneDay.id && (
                      <Text style={styles.onOff}>Вых</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </SafeAreaView>
        </Animated.ScrollView>

        <Animated.ScrollView
          style={[styles.sliderAdminMenu, {translateX: streamScheduleValue}]}>
          <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
            <AdminHeader
              cancel
              ready
              navigation={props.navigation}
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
                        setIsClickedWorkTime(false);
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
                    {oneDay && oneDay.id && (
                      <Text style={styles.onOff}>Откл</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </SafeAreaView>
        </Animated.ScrollView>
        <Animated.ScrollView
          style={[styles.sliderAdminMenu, {translateX: translationValue}]}>
          <SafeAreaView style={{backgroundColor: '#eee', flex: 1}}>
            <AdminHeader
              navigation={props.navigation}
              moveOut={moveOut}
              who={translationValue}
            />
            <NodeCameraView
              style={styles.nodeCameraStyle}
              ref={vbRef}
              outputUrl={'rtmp://194.87.235.18/streaming/klever'}
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
            <Text style={styles.headerTranslTitle}>ТРАНСЛЯЦИЯ</Text>

            {/* <TouchableOpacity
          style={{height: 50}}
          onPress={() => {
            vbRef.current.switchCamera();
          }}>
          <Text>SWITCH CAMERA</Text>
        </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.translStartStopBtn}
              onPress={() => {
                requestCameraPermission();
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
          </SafeAreaView>
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
      </SafeAreaView>
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
    top: 50,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    width: '100%',
    translateX: -Dimensions.get('window').width,
    flex: 1,
  },
  headerTranslTitle: {
    width: '100%',
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    top: 60,
    color: '#fff',
    textAlign: 'center',
  },
  profileWrap: {
    padding: 20,
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
  categoryBtnsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nodeCameraStyle: {
    height: Dimensions.get('window').height - 74,
    width: '100%',
  },
  translStartStopBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  noPickerImageStyle: {
    alignSelf: 'center',
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8 * 0.56,
    backgroundColor: '#f2f2f7',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPickerImageText: {
    color: '#aeaeae',
    fontSize: 18,
  },
  pickerImageStyle: {
    alignSelf: 'center',
    borderRadius: 5,
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8 * 0.56,
  },
  streamOffMainWrap: {
    flexDirection: 'row',
    paddingTop: 20,
    alignItems: 'center',
    paddingHorizontal: 10,
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
  cameraAddress: {
    margin: 10,
  },
  textInputWrap: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputText: {
    fontSize: 16,
    color: '#4F4F4F',
    fontWeight: 'bold',
  },
  textInputTitleText: {
    fontSize: 16,
    color: '#4F4F4F',
    fontWeight: 'bold',
    flex: 1,
  },
  addressText: {
    flex: 2.5,
  },
  textDescLimit: {
    textAlign: 'right',
    fontSize: 12,
    marginRight: 10,
  },
  textInputStyle: {
    borderBottomColor: '#999',
    borderBottomWidth: 1,
    flex: 2.5,
    fontSize: 16,
    fontWeight: '300',
  },
  btnCategoryWrap: {
    marginTop: 10,
    flex: 2.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  btnCategoryOuter: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#C4C4C4',
    borderWidth: 1,
    width: 70,
    height: 35,
  },
  btnCategoryInNewWindow: {
    width: Dimensions.get('window').width / 2 - 20,
    height: 50,
    margin: 10,
  },
  btnCategoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  btnCategoryInner: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  chooseNewCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e32a6c',
  },
  textInputMultilineStyleWrap: {
    flex: 2.5,
  },
  textInputMultilineStyle: {
    borderBottomColor: '#4f4f4f',
    borderBottomWidth: 1,
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 24,
    paddingLeft: 5,
    paddingBottom: 12,
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
  onOff: {
    fontSize: 16,
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
  mapWrap: {
    position: 'relative',
    flex: 1,
    borderRadius: 5,
    backgroundColor: '#999',
    overflow: 'hidden',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  addressStyle: {
    position: 'absolute',
    width: Dimensions.get('window').width - 30,
    top: 15,
    left: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
});

export default Admin;
