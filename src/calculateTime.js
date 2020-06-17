import {EN_SHORT_DAY_OF_WEEK} from './constants';
export const numberDayNow =
  new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
let numberDayYest;

if (new Date().getDay() === 0) {
  numberDayYest = 5;
} else if (new Date().getDay() === 1) {
  numberDayYest = 6;
} else {
  numberDayYest = new Date().getDay() - 2;
}

const dayNameYest = EN_SHORT_DAY_OF_WEEK[numberDayYest].day;
const dayNameNow = EN_SHORT_DAY_OF_WEEK[numberDayNow].day;

const HtoMs = 3600000,
  MtoMs = 60000;

const currentTimeMS =
  new Date().getHours() * HtoMs + new Date().getMinutes() * MtoMs;
const curDay = EN_SHORT_DAY_OF_WEEK[numberDayNow].day;

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

export const isShowStreamNow = (
  item,
  setShowStream,
  setNextStreamTime,
  see_you_tomorrow,
) => {
  if (item.streams[0]) {
    let yesterdayStream, todayStream;

    item.streams[0].schedules.forEach((el) => {
      if (dayNameYest === el.day) {
        yesterdayStream = el;
      }
      if (dayNameNow === el.day) {
        todayStream = el;
      }
    });

    const startYesterdayStreamMS =
      yesterdayStream &&
      yesterdayStream.start_time.split(':')[0] * HtoMs +
        yesterdayStream.start_time.split(':')[1] * MtoMs;
    const endYesterdayStreamMS =
      yesterdayStream &&
      yesterdayStream.end_time.split(':')[0] * HtoMs +
        yesterdayStream.end_time.split(':')[1] * MtoMs;

    const startTodayStreamMS =
      todayStream &&
      todayStream.start_time.split(':')[0] * HtoMs +
        todayStream.start_time.split(':')[1] * MtoMs;
    const endTodayStreamMS =
      todayStream &&
      todayStream.end_time.split(':')[0] * HtoMs +
        todayStream.end_time.split(':')[1] * MtoMs;

    if (
      startYesterdayStreamMS > endYesterdayStreamMS &&
      endYesterdayStreamMS > currentTimeMS &&
      !see_you_tomorrow
    ) {
      // идет видео за вчерашний день ещe
      setShowStream(true);
    } else if (
      startTodayStreamMS >= endTodayStreamMS &&
      currentTimeMS >= startTodayStreamMS &&
      !see_you_tomorrow
    ) {
      // если видео началось сегодня и закончилось завтра

      setShowStream(true);
    } else if (
      startTodayStreamMS < endTodayStreamMS &&
      currentTimeMS > startTodayStreamMS &&
      currentTimeMS < endTodayStreamMS &&
      !see_you_tomorrow
    ) {
      // началось и закончилось сегодня
      setShowStream(true);
    } else {
      setShowStream(false);

      const STobject = SetNewTimeObject(item.streams[0].schedules);
      const sortedArr = [];
      EN_SHORT_DAY_OF_WEEK.forEach((el, i) => {
        sortedArr.push(STobject[el.day]);
      });
      let isSetTime = false;

      for (let i = 0; i < sortedArr.length; i++) {
        const streamWillBeToday = sortedArr[i] && sortedArr[i].day === curDay;
        if (streamWillBeToday) {
          const todayStartStream =
            sortedArr[i].start_time.split(':')[0] * HtoMs +
            sortedArr[i].start_time.split(':')[1] * MtoMs;
          if (currentTimeMS < todayStartStream) {
            setNextStreamTime({
              id: item.id,
              day: 'сегодня',
              start_time: sortedArr[i].start_time,
            });
            isSetTime = true;
          }
        }
      }
      if (!isSetTime) {
        for (let i = 0; i < sortedArr.length; i++) {
          if (sortedArr[i] && i > numberDayNow) {
            if (sortedArr[i].start_time) {
              setNextStreamTime({
                id: item.id,
                day: sortedArr[i].day,
                start_time: sortedArr[i].start_time,
              });

              isSetTime = true;
              break;
            }
          }
        }
      }
      if (!isSetTime) {
        for (let i = 0; i < sortedArr.length; i++) {
          if (sortedArr[i] && i < numberDayNow) {
            if (sortedArr[i].start_time) {
              setNextStreamTime({
                id: item.id,
                day: sortedArr[i].day,
                start_time: sortedArr[i].start_time,
              });
              isSetTime = true;
              break;
            }
          }
        }
      }
    }
  }
};

export const isWorkTimeNow = (
  item,
  setWorkTime,
  setIsWork,
  setNextWorkTime = () => {},
) => {
  let yesterdayWorkTime, todayWorkTime;

  item.schedules.forEach((el) => {
    if (dayNameYest === el.day) {
      yesterdayWorkTime = el;
    }
    if (dayNameNow === el.day) {
      todayWorkTime = el;
    }
  });

  const endYesterdayMS =
    yesterdayWorkTime &&
    yesterdayWorkTime.end_time.split(':')[0] * HtoMs +
      yesterdayWorkTime.end_time.split(':')[1] * MtoMs;
  const startYesterdayMS =
    yesterdayWorkTime &&
    yesterdayWorkTime.start_time.split(':')[0] * HtoMs +
      yesterdayWorkTime.start_time.split(':')[1] * MtoMs;
  const endTodayMS =
    todayWorkTime &&
    todayWorkTime.end_time.split(':')[0] * HtoMs +
      todayWorkTime.end_time.split(':')[1] * MtoMs;
  const startTodayMS =
    todayWorkTime &&
    todayWorkTime.start_time.split(':')[0] * HtoMs +
      todayWorkTime.start_time.split(':')[1] * MtoMs;

  if (startYesterdayMS > endYesterdayMS && endYesterdayMS > currentTimeMS) {
    // идет работа за вчерашний день ещe
    setIsWork(true);
    setWorkTime(
      yesterdayWorkTime &&
        yesterdayWorkTime.start_time.split(':')[0] +
          ':' +
          yesterdayWorkTime.start_time.split(':')[1] +
          '-' +
          yesterdayWorkTime.end_time.split(':')[0] +
          ':' +
          yesterdayWorkTime.end_time.split(':')[1],
    );
  } else if (startTodayMS > endTodayMS && currentTimeMS > startTodayMS) {
    // если работа началось сегодня и закончилось завтра
    setIsWork(true);
    setWorkTime(
      todayWorkTime &&
        todayWorkTime.start_time.split(':')[0] +
          ':' +
          todayWorkTime.start_time.split(':')[1] +
          '-' +
          todayWorkTime.end_time.split(':')[0] +
          ':' +
          todayWorkTime.end_time.split(':')[1],
    );
  } else if (
    startTodayMS < endTodayMS &&
    currentTimeMS > startTodayMS &&
    currentTimeMS < endTodayMS
  ) {
    // началось и закончилось сегодня
    setIsWork(true);
    setWorkTime(
      todayWorkTime &&
        todayWorkTime.start_time.split(':')[0] +
          ':' +
          todayWorkTime.start_time.split(':')[1] +
          '-' +
          todayWorkTime.end_time.split(':')[0] +
          ':' +
          todayWorkTime.end_time.split(':')[1],
    );
  } else {
    setIsWork(false);
    setWorkTime(
      todayWorkTime &&
        todayWorkTime.start_time.split(':')[0] +
          ':' +
          todayWorkTime.start_time.split(':')[1] +
          '-' +
          todayWorkTime.end_time.split(':')[0] +
          ':' +
          todayWorkTime.end_time.split(':')[1],
    );

    const STobject = SetNewTimeObject(item.schedules);
    const sortedArr = [];
    EN_SHORT_DAY_OF_WEEK.forEach((el, i) => {
      sortedArr.push(STobject[el.day]);
    });
    let isSetTime = false;
    for (let i = 0; i < sortedArr.length; i++) {
      const streamWillBeToday = sortedArr[i] && sortedArr[i].day === curDay;
      if (streamWillBeToday) {
        const todayStartStream =
          sortedArr[i].start_time.split(':')[0] * HtoMs +
          sortedArr[i].start_time.split(':')[1] * MtoMs;
        if (currentTimeMS < todayStartStream) {
          setNextWorkTime({
            day: 'сегодня',
            start_time: sortedArr[i].start_time,
            end_time: sortedArr[i].end_time,
          });

          isSetTime = true;
        }
      }
    }
    if (!isSetTime) {
      for (let i = 0; i < sortedArr.length; i++) {
        if (sortedArr[i] && i > numberDayNow) {
          if (sortedArr[i].start_time) {
            setNextWorkTime({
              day: sortedArr[i].day,
              start_time: sortedArr[i].start_time,
              end_time: sortedArr[i].end_time,
            });

            isSetTime = true;
            break;
          }
        }
      }
    }
    if (!isSetTime) {
      for (let i = 0; i < sortedArr.length; i++) {
        if (sortedArr[i] && i < numberDayNow) {
          if (sortedArr[i].start_time) {
            setNextWorkTime({
              day: sortedArr[i].day,
              start_time: sortedArr[i].start_time,
              end_time: sortedArr[i].end_time,
            });
            isSetTime = true;
            break;
          }
        }
      }
    }
  }
};
