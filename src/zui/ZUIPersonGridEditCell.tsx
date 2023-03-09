import { Close } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useRouter } from 'next/router';
import { Msg, PlainMessage, useMessages } from 'core/i18n';

import messageIds from './l10n/messageIds';
import { usePersonSelect } from './ZUIPersonSelect';
import { ZetkinPerson } from 'utils/types/zetkin';
import ZUIAvatar from 'zui/ZUIAvatar';

import {
  Box,
  Button,
  InputBase,
  List,
  ListItem,
  ListSubheader,
  Paper,
  Popper,
  Theme,
  Typography,
  useAutocomplete,
} from '@mui/material';
import { FC, HTMLAttributes, useState } from 'react';

const ZUIPersonGridEditCell: FC<{
  cell?: (Partial<Omit<ZetkinPerson, 'id'>> & { id: number | null }) | null;
  onUpdate: (person: ZetkinPerson | null) => void;
  removePersonLabel: PlainMessage;
  restrictedMode?: boolean;
  suggestedPeople: ZetkinPerson[];
  suggestedPeopleLabel: PlainMessage;
}> = ({
  cell,
  onUpdate,
  removePersonLabel,
  restrictedMode: isRestrictedMode = false,
  suggestedPeople,
  suggestedPeopleLabel,
}) => {
  const messages = useMessages(messageIds);

  const query = useRouter().query;
  const styles = useStyles({ isRestrictedMode });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searching, setSearching] = useState(false);

  const orgId = parseInt(query.orgId as string);

  const personSelect = usePersonSelect({
    initialValue: '',
    onChange: (person) => {
      onUpdate(person);
      setSearching(false);
      setAnchorEl(null);
    },
    selectedPerson: null,
  });

  const autoComplete = useAutocomplete({
    ...personSelect.autoCompleteProps,
    disabled: isRestrictedMode,
  });

  let searchResults = autoComplete.groupedOptions as ZetkinPerson[];
  const showSuggestedPeople =
    suggestedPeople.length && (!cell?.id || searching);

  if (searchResults.length) {
    // Filter down suggestedPeople to only include search matches
    const matchingIds = searchResults.map((person) => person.id);
    suggestedPeople = suggestedPeople.filter((person) =>
      matchingIds.includes(person.id)
    );

    // Filter search results to exclude suggested people
    searchResults = searchResults.filter(
      (p) => !suggestedPeople.find((s) => s.id == p.id)
    );
  }

  return (
    <Box
      onMouseEnter={(ev) => {
        setAnchorEl(ev.currentTarget);
      }}
      onMouseLeave={() => {
        setAnchorEl(null);
      }}
    >
      <Box ref={(div: HTMLDivElement) => setAnchorEl(div)}>
        <InputBase
          /* eslint-disable-next-line jsx-a11y/no-autofocus */
          autoFocus
          fullWidth
          inputProps={autoComplete.getInputProps()}
          onChange={() => setSearching(true)}
          placeholder={messages.personSelect.search()}
        ></InputBase>
      </Box>
      {searchResults.length || suggestedPeople.length ? (
        <Popper
          anchorEl={anchorEl}
          open={!!anchorEl}
          popperOptions={{
            placement: 'bottom',
          }}
        >
          <Paper
            className={styles.popper}
            elevation={2}
            onClick={(ev) => {
              ev.stopPropagation();
              anchorEl?.focus();
            }}
          >
            {isRestrictedMode && (
              <Box
                alignItems="center"
                display="flex"
                flexDirection="column"
                gap={1}
                justifyContent="center"
                width="100%"
              >
                {!!cell && (
                  <SelectedPerson orgId={orgId} person={cell as ZetkinPerson} />
                )}
                <Typography fontStyle="italic" variant="caption">
                  {messages.personGridEditCell.restrictedMode()}
                </Typography>
              </Box>
            )}
            {!isRestrictedMode && (
              <Box display="flex" flexDirection="column" height="100%">
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    height: 'calc(100% - 10px)',
                    justifyContent: 'center',
                    minWidth: '290px',
                    width: '100%',
                  }}
                >
                  {!!cell?.id && (
                    <Box
                      alignItems="center"
                      display="flex"
                      flexDirection="column"
                      gap={1}
                      justifyContent="center"
                    >
                      {!isRestrictedMode && !searching && (
                        <>
                          <SelectedPerson
                            orgId={orgId}
                            person={cell as ZetkinPerson}
                          />
                          <Button
                            endIcon={<Close />}
                            onClick={() => onUpdate(null)}
                            sx={{
                              cursor: 'pointer',
                            }}
                          >
                            <Msg id={removePersonLabel} />
                          </Button>
                        </>
                      )}
                    </Box>
                  )}
                  <List
                    className={styles.searchingList}
                    sx={{ display: showSuggestedPeople ? 'block' : 'none' }}
                  >
                    {showSuggestedPeople && !!suggestedPeople.length && (
                      <List>
                        <ListSubheader>
                          <Msg id={suggestedPeopleLabel} />
                        </ListSubheader>
                        {suggestedPeople.map((option) => (
                          <PersonListItem
                            key={option.id}
                            itemProps={{
                              onClick: () => {
                                onUpdate(option);
                              },
                            }}
                            orgId={orgId}
                            person={option}
                          />
                        ))}
                      </List>
                    )}
                    {searching && (
                      <List {...autoComplete.getListboxProps()}>
                        <ListSubheader sx={{ position: 'relative' }}>
                          {suggestedPeople.length
                            ? messages.personGridEditCell.otherPeople()
                            : messages.personGridEditCell.searchResults()}
                        </ListSubheader>
                        {searchResults.map((option, index) => {
                          const optProps = autoComplete.getOptionProps({
                            index,
                            option,
                          });
                          return (
                            <PersonListItem
                              key={option.id}
                              itemProps={optProps}
                              orgId={orgId}
                              person={option}
                            />
                          );
                        })}
                      </List>
                    )}
                  </List>
                </Box>
              </Box>
            )}
          </Paper>
        </Popper>
      ) : (
        <></>
      )}
    </Box>
  );
};

const PersonListItem: FC<{
  itemProps: HTMLAttributes<HTMLLIElement>;
  orgId: number;
  person: ZetkinPerson;
}> = ({ itemProps, orgId, person }) => {
  return (
    <ListItem
      {...itemProps}
      disablePadding
      sx={{ paddingBottom: 0.5, paddingTop: 0.5 }}
    >
      <Box
        sx={{
          cursor: 'pointer',
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
        }}
      >
        <ZUIAvatar orgId={orgId} personId={person.id} size="sm" />
        <Typography component="span">
          {`${person.first_name} ${person.last_name}`}
        </Typography>
      </Box>
    </ListItem>
  );
};

const SelectedPerson: FC<{ orgId: number; person: ZetkinPerson }> = ({
  orgId,
  person,
}) => {
  return (
    <>
      <ZUIAvatar orgId={orgId} personId={person.id} size="lg" />
      <Typography>{`${person.first_name} ${person.last_name}`}</Typography>
    </>
  );
};

const useStyles = makeStyles<Theme, { isRestrictedMode: boolean }>({
  popper: {
    display: 'flex',
    flexDirection: 'column',
    height: (props) => (props.isRestrictedMode ? 'auto' : 400),
    width: 300,
  },
  searchingList: {
    height: 'calc(100% - 40px)',
    minWidth: '250px',
    overflowY: 'scroll',
    paddingLeft: '20px',
    position: 'absolute',
    width: '100%',
  },
});

export default ZUIPersonGridEditCell;
