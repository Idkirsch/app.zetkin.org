import { Button } from '@mui/material';
import { Box } from '@mui/system';
import dayjs from 'dayjs';
import { useState } from 'react';

import CalendarDayView from './CalendarDayView';
import CalendarMonthView from './CalendarMonthView';
import CalendarNavBar from './CalendarNavBar';
import CalendarWeekView from './CalendarWeekView';

export enum TimeScale {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}
interface CalendarProps {
  orgId: number;
}
const Calendar = ({ orgId }: CalendarProps) => {
  const [focusDate, setFocusDate] = useState<Date>(new Date());
  const [selectedTimeScale, setSelectedTimeScale] = useState<TimeScale>(
    TimeScale.MONTH
  );

  return (
    <Box display="flex" flexDirection="column" height={'100%'} padding={2}>
      <CalendarNavBar
        focusDate={focusDate}
        onChangeFocusDate={(date) => {
          setFocusDate(date);
        }}
        onChangeTimeScale={(timeScale) => {
          setSelectedTimeScale(timeScale);
        }}
        orgId={orgId}
        onStepBackward={() => {
          setFocusDate(
            dayjs(focusDate).subtract(1, selectedTimeScale).toDate()
          );
        }}
        onStepForward={() => {
          setFocusDate(dayjs(focusDate).add(1, selectedTimeScale).toDate());
        }}
        timeScale={selectedTimeScale}
      />

      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        marginTop={2}
        overflow="auto"
      >
        {selectedTimeScale === TimeScale.DAY && <CalendarDayView />}
        {selectedTimeScale === TimeScale.WEEK && (
          <CalendarWeekView focusDate={focusDate} />
        )}
        {selectedTimeScale === TimeScale.MONTH && (
          <CalendarMonthView focusDate={focusDate} />
        )}
      </Box>
    </Box>
  );
};

export default Calendar;
