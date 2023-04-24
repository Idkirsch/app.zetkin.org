import Box from '@mui/material/Box';
import CalendarDayDate from './CalendarDayDate';
import CalendarDayViewActivity, { STATUS_COLORS } from "./CalendarDayViewActivity";
import CalendarDayOtherActivities from './CalendarDayOtherActivities';
import { DayInfo } from './types';

export interface CalendarDayItemProps {
  date: Date;
  dayInfo: DayInfo;
  focusDate: Date;
}

const CalendarDayItem = ({
  date,
  dayInfo,
  focusDate,
}: CalendarDayItemProps) => {
  return (
    <Box
      display="flex"
      sx={{
        marginBottom: '0.5em',
        backgroundColor: '#eeeeee',
      }}
    >
      <Box
        sx={{
          width: 300
        }}
      >
        <Box sx={{
          padding: "1em"
        }}>
          <CalendarDayDate focusDate={focusDate} date={date} />
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          padding: '1em',
          width: '100%',
          gap: "0.7em"
        }}
      >
        {(dayInfo.activities_starts.length > 0 ||
          dayInfo.activities_ends.length > 0) && (
          <CalendarDayOtherActivities dayInfo={dayInfo} />
        )}
        {dayInfo.events.map((event, i) => (
          // TODO: Use statusColor in reasonable way
          <CalendarDayViewActivity statusColor={STATUS_COLORS.GREEN} event={event} />
        ))}
      </Box>
    </Box>
  );
};

export default CalendarDayItem;
