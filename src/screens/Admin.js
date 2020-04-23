import React, {useState, useEffect} from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import Dialog, {ScaleAnimation, DialogContent} from 'react-native-popup-dialog';
import Video from 'react-native-video';
import gql from 'graphql-tag';
import {EN_SHORT_DAY_OF_WEEK} from '../constants';

import DateTimePicker from '@react-native-community/datetimepicker';
import {Query, Mutation, useMutation, useQuery} from 'react-apollo';
import Header from '../components/Header';

import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from 'accordion-collapse-react-native';

const GET_PLACE = gql`
  query GETPLACE($id: ID!) {
    place(id: $id) {
      id
      name
      address
      description
      logo
      menu
      actions
      coordinates
      streams {
        url
        name
        id
        preview
        schedules {
          id
          day
          start_time
          end_time
        }
      }
      schedules {
        id
        day
        start_time
        end_time
      }
      categories {
        id
        name
      }
    }
  }
`;

const CREATE_WORK_TIME = gql`
  mutation CREATEWORKTIME(
    $id: ID!
    $day: WeekDay!
    $start_time: String!
    $end_time: String!
  ) {
    updatePlace(
      input: {
        id: $id
        schedules: {
          create: {day: $day, start_time: $start_time, end_time: $end_time}
        }
      }
    ) {
      id
    }
  }
`;

const UPDATE_WORK_SCHEDULE = gql`
  mutation UPDATEWORKSCHEDULE(
    $id: ID!
    $start_time: String!
    $end_time: String!
  ) {
    updateSchedule(
      input: {id: $id, start_time: $start_time, end_time: $end_time}
    ) {
      id
    }
  }
`;

const DELETE_SCHEDULE = gql`
  mutation DELETESCHEDULE($id: ID!) {
    deleteSchedule(id: $id) {
      id
    }
  }
`;

const UPDATE_STREAMS_SCHEDULE = gql`
  mutation UPDATESTREAMSSCHEDULE($id: ID!, $update: [UpdateScheduleInput!]) {
    updateStream(input: {id: $id, schedules: {update: $update}}) {
      id
    }
  }
`;

const CREATE_STREAMS_SCHEDULE = gql`
  mutation CREATESTREAMSSCHEDULE(
    $id: ID!
    $day: WeekDay!
    $start_time: String!
    $end_time: String!
  ) {
    updateStream(
      input: {
        id: $id
        schedules: {
          create: [{day: $day, start_time: $start_time, end_time: $end_time}]
        }
      }
    ) {
      id
    }
  }
`;

const Admin = (props) => {
  const {streams, schedules} = props.navigation.state.params.item;

  const [popupVisible, setPopupVisible] = useState(false);

  const SetNewTimeObject = (data) => {
    const timeObject = {};
    EN_SHORT_DAY_OF_WEEK.forEach((e, i) => {
      data.forEach((el, ind) => {
        if (!timeObject[e.day]) {
          timeObject[e.day] = 'Пусто';
        }
        if (el.day) {
          timeObject[el.day] = el;
        }
      });
    });
    return timeObject;
  };
  // ================================
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
  const [inputDescription, setInputDescription] = useState('');

  useEffect(() => {
    setPickedStartTime('');
    setPickedEndTime('');
  }, [popupVisible]);

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

  const setAsDayOf = (day) => {
    if (day.id) {
      DELETE_SCHEDULE_mutation({
        variables: {
          id: day.id,
        },
        optimisticResponse: null,
      });
      setTimeout(() => {
        refetch();
      }, 300);
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
        });
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
        });
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

  const onChange = (event, selectedTime) => {
    const currentDate = selectedTime || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);

    const hours = selectedTime.getHours(),
      minutes = selectedTime.getMinutes();
    if (isPickStartTime) {
      setPickedStartTime(
        '' +
          (hours > 9 ? hours : '0' + hours) +
          ':' +
          (minutes > 9 ? minutes : '0' + minutes),
      );
    } else {
      setPickedEndTime(
        '' +
          (hours > 9 ? hours : '0' + hours) +
          ':' +
          (minutes > 9 ? minutes : '0' + minutes),
      );
    }
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const goToPickImage = () => {
    ImagePicker.openPicker({
      width: 250,
      height: 250,
      cropping: true,
      includeBase64: true,
    }).then((image) => {
      setpPickerImageMime(image.mime);
      setpPickerImageData(image.data);
    });
  };

  if (loading) return <Text>'Loading...'</Text>;
  if (error) return <Text>`Error! ${error.message}`</Text>;
  return (
    <ScrollView style={styles.Admin}>
      <Header props={props} />
      <View style={styles.videoWrap}>
        <Video
          source={{uri: streams[0] && streams[0].url}}
          onBuffer={(buf) => console.log(buf)}
          onError={(err) => console.log(err, '_ERR_')}
          style={styles.backgroundVideo}
        />
      </View>
      <View>
        <Collapse
          onToggle={(isOpen) => {
            // console.log(isOpen);
          }}>
          <CollapseHeader style={styles.tableHeader}>
            <Text>Профиль заведения</Text>
          </CollapseHeader>
          <CollapseBody style={styles.tableBody}>
            <View>
              {pickerImageMime ? (
                <Image
                  style={styles.pickerImageStyle}
                  source={{
                    uri: `data:${pickerImageMime};base64,${pickerImageData}`,
                  }}
                />
              ) : (
                <View style={styles.noPickerImageStyle}>
                  <Text style={styles.noPickerImageText}>Загрузить фото</Text>
                  <Text style={styles.noPickerImageText}>250 X 250</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.imageUploader}
                onPress={() => goToPickImage()}>
                <Text style={styles.changePhotoText}>Сменить фото профиля</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.textInputWrap}>
              <Text style={styles.textInputTitleText}>Название заведения:</Text>
              <TextInput
                style={styles.textInputStyle}
                onChangeText={(text) => setInputName(text)}
                value={inputName}
              />
            </View>
            <View style={styles.textInputWrap}>
              <Text style={styles.textInputTitleText}>Псевдоним:</Text>
              <TextInput
                style={styles.textInputStyle}
                onChangeText={(text) => setInputPseudonim(text)}
                value={inputPseudonim}
              />
            </View>
            <View style={styles.textInputWrap}>
              <Text style={styles.textInputTitleText}>Категория:</Text>
              <View style={styles.btnCategoryWrap}>
                <TouchableOpacity style={styles.btnCategory}>
                  <Text>Бар</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.textInputWrap}>
              <Text style={styles.textInputTitleText}>Адрес заведения:</Text>
              <TextInput
                style={styles.textInputStyle}
                onChangeText={(text) => {}}
                value={'Адрес'}
              />
              <TouchableOpacity style={styles.pinkBtn}>
                <Text style={styles.pinkBtnText}>ВЫБРАТЬ АДРЕС НА КАРТЕ</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.textInputWrap}>
              <Text style={styles.textInputTitleText}>Описание:</Text>
              <TextInput
                maxLength={300}
                multiline={true}
                style={styles.textInputMultilineStyle}
                onChangeText={(text) => setInputDescription(text)}
                value={inputDescription}
              />
            </View>
            <TouchableOpacity style={styles.pinkBtn}>
              <Text style={styles.pinkBtnText}>СОХРАНИТЬ</Text>
            </TouchableOpacity>
          </CollapseBody>
        </Collapse>
        <Collapse
          onToggle={(isOpen) => {
            // console.log(isOpen);
          }}>
          <CollapseHeader style={styles.tableHeader}>
            <Text>График работы</Text>
          </CollapseHeader>
          <CollapseBody style={styles.tableBody}>
            {EN_SHORT_DAY_OF_WEEK.map((el, i) => {
              let oneDay = SetNewTimeObject(data.place.schedules)[el.day];

              return (
                <View key={i} style={styles.graphRow}>
                  <Text style={styles.graphDay}>{el.day}</Text>
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
                    onPress={() => {
                      setAsDayOf(oneDay);
                    }}>
                    <Text style={styles.graphTimeText}>Вых</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </CollapseBody>
        </Collapse>
        {/* -------------------------------- */}
        <Collapse
          onToggle={(isOpen) => {
            // console.log(isOpen);
          }}>
          <CollapseHeader style={styles.tableHeader}>
            <Text>График трансляций</Text>
          </CollapseHeader>
          <CollapseBody style={styles.tableBody}>
            {EN_SHORT_DAY_OF_WEEK.map((el, i) => {
              let oneDay = SetNewTimeObject(
                data.place.streams[0] ? data.place.streams[0].schedules : [],
              )[el.day];

              return (
                <View key={i} style={styles.graphRow}>
                  <Text style={styles.graphDay}>{el.day}</Text>
                  <TouchableOpacity
                    style={styles.graphTime}
                    onPress={() => {
                      if (!data.place.streams[0]) {
                        alert('Стрим еще не создан');
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
                        alert('Стрим еще не создан');
                      } else {
                        setAsDayOf(oneDay);
                      }
                    }}>
                    <Text style={styles.graphTimeText}>Откл</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </CollapseBody>
        </Collapse>
      </View>
      <Dialog
        visible={popupVisible}
        onTouchOutside={() => {
          setPopupVisible(false);
        }}
        dialogAnimation={
          new ScaleAnimation({
            initialValue: 0,
            useNativeDriver: true,
          })
        }>
        <DialogContent>
          {selectedDay && (
            <View style={styles.dialogContent}>
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
                <View style={styles.space}></View>
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
                  setTimeout(() => {
                    refetch();
                  }, 500);
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
          onChange={onChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  Admin: {
    flex: 1,
  },
  videoWrap: {
    height: 250,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
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
  textInputWrap: {
    marginVertical: 20,
  },
  textInputTitleText: {
    fontSize: 16,
    color: '#4F4F4F',
  },
  textInputStyle: {
    borderBottomColor: '#999',
    borderBottomWidth: 1,
  },
  btnCategoryWrap: {
    marginTop: 10,
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
});

export default Admin;
