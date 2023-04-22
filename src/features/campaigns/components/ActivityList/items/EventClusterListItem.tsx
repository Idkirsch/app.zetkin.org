import { FC, useContext } from 'react';
import {
  Group,
  PlaceOutlined,
  ScheduleOutlined,
  SplitscreenOutlined,
} from '@mui/icons-material';

import { EventState } from 'features/events/models/EventDataModel';
import MultiLocationIcon from 'zui/icons/MultiLocation';
import { removeOffset } from 'utils/dateUtils';
import { ZetkinEvent } from 'utils/types/zetkin';
import ZUIIconLabelRow from 'zui/ZUIIconLabelRow';
import ZUITimeSpan from 'zui/ZUITimeSpan';
import ActivityListItem, { STATUS_COLORS } from './ActivityListItem';
import {
  CLUSTER_TYPE,
  ClusteredEvent,
} from 'features/campaigns/hooks/useClusteredActivities';

import { EnvContext } from 'core/env/EnvContext';
import { EventWarningIconsSansModel } from 'features/events/components/EventWarningIcons';
import getEventStats from 'features/events/rpc/getEventStats';
import { loadItemIfNecessary } from 'core/caching/cacheUtils';
import { RootState } from 'core/store';
import { useStore } from 'react-redux';
import { statsLoad, statsLoaded } from 'features/events/store';

interface EventListeItemProps {
  cluster: ClusteredEvent;
}

const EventClusterListItem: FC<EventListeItemProps> = ({ cluster }) => {
  const {
    allHaveContacts,
    campaignId,
    color,
    endTime,
    eventId,
    location,
    numBooked,
    numParticipantsRequired,
    numPending,
    numReminded,
    statsLoading,
    orgId,
    startTime,
    title,
  } = useEventClusterData(cluster);

  return (
    <ActivityListItem
      color={color}
      endNumber={`${numBooked} / ${numParticipantsRequired}`}
      endNumberColor={numBooked < numParticipantsRequired ? 'error' : undefined}
      href={`/organize/${orgId}/projects/${campaignId}/events/${eventId}`}
      meta={
        <EventWarningIconsSansModel
          compact={false}
          hasContact={allHaveContacts}
          numParticipants={numBooked}
          numRemindersSent={numReminded}
          numSignups={numPending}
          participantsLoading={statsLoading}
        />
      }
      PrimaryIcon={
        cluster.kind == CLUSTER_TYPE.MULTI_LOCATION
          ? MultiLocationIcon
          : SplitscreenOutlined
      }
      SecondaryIcon={Group}
      subtitle={
        <ZUIIconLabelRow
          color="secondary"
          iconLabels={[
            {
              icon: <ScheduleOutlined fontSize="inherit" />,
              label: (
                <ZUITimeSpan
                  end={new Date(removeOffset(endTime))}
                  start={new Date(removeOffset(startTime))}
                />
              ),
            },
            {
              icon: <PlaceOutlined fontSize="inherit" />,
              label: location.title,
            },
          ]}
          size="sm"
        />
      }
      title={title}
    />
  );
};

export default EventClusterListItem;

function useEventClusterData(cluster: ClusteredEvent) {
  const numParticipantsRequired = cluster.events.reduce(
    (sum, event) => sum + event.num_participants_required,
    0
  );

  let statsLoading = false;
  const store = useStore<RootState>();
  const state = store.getState();
  const env = useContext(EnvContext);
  const allStats = cluster.events.map((event) => {
    const future = loadItemIfNecessary(
      state.events.statsByEventId[event.id],
      store,
      {
        actionOnLoad: () => statsLoad(event.id),
        actionOnSuccess: (stats) => statsLoaded([event.id, stats]),
        loader: () => {
          return env!.apiClient.rpc(getEventStats, {
            eventId: event.id,
            orgId: event.organization.id,
          });
        },
      }
    );

    if (future.isLoading) {
      statsLoading = true;
    }

    return future.data;
  });

  const allHaveContacts = cluster.events.reduce(
    (allTrue, event) => allTrue && !!event.contact,
    true
  );

  // Get the state of the events, or UNKNOWN if the states vary
  let status = getEventState(cluster.events[0]);
  if (cluster.events.filter((event) => getEventState(event) != status).length) {
    status = EventState.UNKNOWN;
  }

  let numBooked = 0;
  let numPending = 0;
  let numReminded = 0;
  if (!statsLoading) {
    allStats.forEach((stats) => {
      if (stats) {
        numPending += stats.numPending;
        numBooked += stats.numBooked;
        numReminded += stats.numReminded;
      }
    });
  }

  let color = STATUS_COLORS.GRAY;
  if (status === EventState.OPEN) {
    color = STATUS_COLORS.GREEN;
  } else if (status === EventState.ENDED) {
    color = STATUS_COLORS.RED;
  } else if (status === EventState.SCHEDULED) {
    color = STATUS_COLORS.BLUE;
  }

  const firstEvent = cluster.events[0];
  const campaignId = firstEvent.campaign?.id ?? 'standalone';
  const location = firstEvent.location;
  const orgId = firstEvent.organization.id;
  const eventId = firstEvent.id;
  const startTime = firstEvent.start_time;
  const endTime = cluster.events[cluster.events.length - 1].end_time;
  const title = firstEvent.title || firstEvent.activity.title;

  return {
    allHaveContacts,
    campaignId,
    color,
    endTime,
    eventId,
    location,
    numBooked,
    numParticipantsRequired,
    numPending,
    numReminded,
    orgId,
    startTime,
    statsLoading,
    title,
  };
}

const getEventState = (data: ZetkinEvent) => {
  if (!data) {
    return EventState.UNKNOWN;
  }

  if (data.start_time) {
    const startTime = new Date(data.start_time);
    const now = new Date();

    if (startTime > now) {
      return EventState.SCHEDULED;
    } else {
      if (data.end_time) {
        const endTime = new Date(data.end_time);

        if (endTime < now) {
          return EventState.ENDED;
        }
      }

      return EventState.OPEN;
    }
  } else {
    return EventState.DRAFT;
  }
};
