import { FC } from 'react';
import NextLink from 'next/link';
import { useIntl } from 'react-intl';
import { WarningSlot } from '../EventWarningIcons';
import { Box, Checkbox, Link, Typography } from '@mui/material';
import {
  ChevronRightOutlined,
  EmojiPeople,
  FaceRetouchingOff,
  MailOutline,
  People,
} from '@mui/icons-material';

import { EventState } from 'features/events/models/EventDataModel';
import messageIds from 'features/events/l10n/messageIds';
import StatusDot from './StatusDot';
import { useMessages } from 'core/i18n';
import ZUIIconLabel from 'zui/ZUIIconLabel';
import { ZetkinEvent, ZetkinEventParticipant } from 'utils/types/zetkin';

export enum CLUSTER_TYPE {
  ARBITRARY = 'arbitrary',
  LOCATION = 'location',
  SHIFT = 'shift',
}

interface EventPopperListItemProps {
  checked: boolean;
  clusterType: CLUSTER_TYPE;
  compact: boolean;
  event: ZetkinEvent;
  onChange: () => void;
  participants: ZetkinEventParticipant[];
  state: EventState;
}

const EventPopperListItem: FC<EventPopperListItemProps> = ({
  checked,
  clusterType,
  compact,
  event,
  onChange,
  participants,
  state,
}) => {
  const intl = useIntl();
  const messages = useMessages(messageIds);
  const warningIcons: (JSX.Element | null)[] = [null, null, null];
  if (!event.contact) {
    warningIcons[0] = (
      <WarningSlot
        key="contact"
        icon={<FaceRetouchingOff color="error" />}
        tooltip={messages.eventPopper.noContact()}
      />
    );
  }

  const numBooked = participants.length;
  if (event.num_participants_available > numBooked) {
    warningIcons[1] = (
      <WarningSlot
        key="signups"
        icon={<EmojiPeople color="error" />}
        tooltip={messages.eventPopper.pendingSignups()}
      />
    );
  }

  const reminded = participants.filter((p) => !!p.reminder_sent);
  const numReminded = reminded.length;
  if (numReminded < participants.length) {
    warningIcons[2] = (
      <WarningSlot
        key="reminders"
        icon={<MailOutline color="error" />}
        tooltip={messages.eventPopper.unsentReminders({
          numMissing: participants.length - numReminded,
        })}
      />
    );
  }

  const timeSpan = `${intl.formatTime(event.start_time)}-${intl.formatTime(
    event.end_time
  )}`;

  return (
    <Box display="flex" flexDirection="column">
      <Box
        alignItems="flex-start"
        display="flex"
        justifyContent="space-between"
      >
        <Box display="flex">
          <Box>
            <Checkbox
              checked={checked}
              onChange={onChange}
              sx={{ padding: '0px' }}
            />
          </Box>
          <Box display="flex" flexDirection="column">
            <Typography fontWeight="bold" sx={{ paddingLeft: 1 }}>
              {clusterType == CLUSTER_TYPE.LOCATION && event.location.title}
              {clusterType == CLUSTER_TYPE.SHIFT && timeSpan}
              {clusterType == CLUSTER_TYPE.ARBITRARY &&
                (event.title || event.activity.title)}
            </Typography>
            {clusterType === CLUSTER_TYPE.ARBITRARY && (
              <Box alignItems="center" display="flex">
                <StatusDot state={state} />
                <Typography variant="body2">{`${timeSpan}, ${event.location.title}`}</Typography>
              </Box>
            )}
          </Box>
        </Box>
        <Box alignItems="center" display="flex">
          <Box display="flex">
            {warningIcons.map((icon, idx) => {
              if (icon) {
                return icon;
              }
              if (!compact) {
                return <WarningSlot key={idx} />;
              }
            })}
          </Box>
          <Box paddingRight={2}>
            <ZUIIconLabel
              color={
                event.num_participants_available <
                event.num_participants_required
                  ? 'error'
                  : 'secondary'
              }
              icon={
                <People
                  color={
                    event.num_participants_available <
                    event.num_participants_required
                      ? 'error'
                      : 'secondary'
                  }
                />
              }
              label={`${event.num_participants_available}/${event.num_participants_required}`}
            />
          </Box>
          <NextLink
            href={`/organize/${event.organization.id}/${
              event.campaign ? `projects/${event.campaign.id}` : 'standalone'
            }/events/${event.id}`}
            passHref
          >
            <Link color="inherit">
              <ChevronRightOutlined />
            </Link>
          </NextLink>
        </Box>
      </Box>
    </Box>
  );
};

export default EventPopperListItem;
