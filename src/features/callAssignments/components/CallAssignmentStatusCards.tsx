import { Edit } from '@mui/icons-material';
import SettingsIcon from '@material-ui/icons/Settings';
import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  ClickAwayListener,
  Grid,
  List,
  Paper,
  Popper,
  TextField,
  Typography,
} from '@mui/material';
import { FormattedMessage as Msg, useIntl } from 'react-intl';

import CallAssignmentModel from '../models/CallAssignmentModel';
import SmartSearchDialog from 'features/smartSearch/components/SmartSearchDialog';
import StatusCardHeader from './StatusCardHeader';
import StatusCardItem from './StatusCardItem';

interface CallAssignmentStatusCardProps {
  model: CallAssignmentModel;
}

const CallAssignmentStatusCards = ({
  model,
}: CallAssignmentStatusCardProps) => {
  const intl = useIntl();
  const { data: stats } = model.getStats();
  const { data } = model.getData();
  const cooldown = data?.cooldown ?? null;
  const hasTargets = model.hasTargets;
  const goalQuery = data?.goal;

  const [anchorEl, setAnchorEl] = useState<
    null | (EventTarget & SVGSVGElement)
  >(null);
  const [newCooldown, setNewCooldown] = useState<number | null>(cooldown);
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);

  return (
    <Grid container spacing={2}>
      <Grid item md={4} xs={12}>
        <Card>
          <StatusCardHeader
            chipColor={hasTargets ? 'orange' : 'gray'}
            subtitle={intl.formatMessage({
              id: 'pages.organizeCallAssignment.blocked.subtitle',
            })}
            title={intl.formatMessage({
              id: 'pages.organizeCallAssignment.blocked.title',
            })}
            value={stats?.blocked}
          />
          <List>
            <StatusCardItem
              action={
                <Box display="flex" justifyContent="space-between">
                  <Typography color="secondary" variant="h5">
                    <Msg
                      id="pages.organizeCallAssignment.blocked.hours"
                      values={{ cooldown }}
                    />
                  </Typography>
                  <Box ml={1}>
                    <SettingsIcon
                      color="secondary"
                      cursor="pointer"
                      onClick={(event) =>
                        setAnchorEl(anchorEl ? null : event.currentTarget)
                      }
                    />
                  </Box>
                  <Popper anchorEl={anchorEl} open={!!anchorEl}>
                    <ClickAwayListener
                      onClickAway={() => {
                        setAnchorEl(null);
                        if (newCooldown != null && newCooldown != cooldown) {
                          model.setCooldown(newCooldown);
                        }
                      }}
                    >
                      <Paper elevation={3} variant="elevation">
                        <Box mt={1} p={2}>
                          <TextField
                            helperText={intl.formatMessage({
                              id: 'pages.organizeCallAssignment.blocked.cooldownHelperText',
                            })}
                            label={intl.formatMessage({
                              id: 'pages.organizeCallAssignment.blocked.cooldownLabel',
                            })}
                            onChange={(ev) => {
                              const val = ev.target.value;

                              if (val == '') {
                                setNewCooldown(null);
                                return;
                              }

                              const intVal = parseInt(val);
                              if (!isNaN(intVal) && intVal.toString() == val) {
                                setNewCooldown(intVal);
                              }
                            }}
                            onKeyDown={(ev) => {
                              if (ev.key === 'Enter') {
                                setAnchorEl(null);
                                if (newCooldown != null) {
                                  model.setCooldown(newCooldown);
                                }
                              } else if (ev.key === 'Escape') {
                                setAnchorEl(null);
                                setNewCooldown(cooldown);
                              }
                            }}
                            value={newCooldown === null ? '' : newCooldown}
                            variant="outlined"
                          />
                        </Box>
                      </Paper>
                    </ClickAwayListener>
                  </Popper>
                </Box>
              }
              title={intl.formatMessage({
                id: 'pages.organizeCallAssignment.blocked.calledTooRecently',
              })}
              value={stats?.calledTooRecently}
            />
            <StatusCardItem
              title={intl.formatMessage({
                id: 'pages.organizeCallAssignment.blocked.callBackLater',
              })}
              value={stats?.callBackLater}
            />
            <StatusCardItem
              title={intl.formatMessage({
                id: 'pages.organizeCallAssignment.blocked.missingPhoneNumber',
              })}
              value={stats?.missingPhoneNumber}
            />
            <StatusCardItem
              title={intl.formatMessage({
                id: 'pages.organizeCallAssignment.blocked.organizerActionNeeded',
              })}
              value={stats?.organizerActionNeeded}
            />
          </List>
        </Card>
      </Grid>
      <Grid item md={4} xs={12}>
        <Card>
          <StatusCardHeader
            chipColor={hasTargets ? 'green' : 'gray'}
            subtitle={intl.formatMessage({
              id: 'pages.organizeCallAssignment.ready.subtitle',
            })}
            title={intl.formatMessage({
              id: 'pages.organizeCallAssignment.ready.title',
            })}
            value={stats?.ready}
          />
          <List>
            <StatusCardItem
              title={intl.formatMessage({
                id: 'pages.organizeCallAssignment.ready.queue',
              })}
              value={stats?.queue}
            />
            <StatusCardItem
              title={intl.formatMessage({
                id: 'pages.organizeCallAssignment.ready.allocated',
              })}
              value={stats?.allocated}
            />
          </List>
        </Card>
      </Grid>
      <Grid item md={4} xs={12}>
        <Card>
          <StatusCardHeader
            chipColor={hasTargets ? 'blue' : 'gray'}
            subtitle={intl.formatMessage({
              id: 'pages.organizeCallAssignment.done.subtitle',
            })}
            title={intl.formatMessage({
              id: 'pages.organizeCallAssignment.done.title',
            })}
            value={stats?.done}
          />
          <Box p={2}>
            <Button
              onClick={() => setQueryDialogOpen(true)}
              startIcon={<Edit />}
              variant="outlined"
            >
              <Msg id="pages.organizeCallAssignment.done.defineButton" />
            </Button>
            {queryDialogOpen && (
              <SmartSearchDialog
                onDialogClose={() => setQueryDialogOpen(false)}
                onSave={(query) => {
                  model.setGoal(query);
                  setQueryDialogOpen(false);
                }}
                query={goalQuery}
              />
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CallAssignmentStatusCards;