import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { SurveyStats } from './rpc/getSurveyStats';
import {
  RemoteItem,
  remoteItem,
  remoteList,
  RemoteList,
} from 'utils/storeUtils';
import {
  ZetkinSurvey,
  ZetkinSurveyElement,
  ZetkinSurveyExtended,
  ZetkinSurveySubmission,
} from 'utils/types/zetkin';

export interface SurveysStoreSlice {
  submissionList: RemoteList<ZetkinSurveySubmission>;
  statsBySurveyId: Record<number, RemoteItem<SurveyStats>>;
  surveyList: RemoteList<ZetkinSurveyExtended>;
}

const initialState: SurveysStoreSlice = {
  statsBySurveyId: {},
  submissionList: remoteList(),
  surveyList: remoteList(),
};

const surveysSlice = createSlice({
  initialState,
  name: 'surveys',
  reducers: {
    elementAdded: (
      state,
      action: PayloadAction<[number, ZetkinSurveyElement]>
    ) => {
      const [surveyId, newElement] = action.payload;
      const surveyItem = state.surveyList.items.find(
        (item) => item.id == surveyId
      );
      if (surveyItem && surveyItem.data) {
        surveyItem.data.elements.push(newElement);
      }
    },
    elementDeleted: (state, action: PayloadAction<[number, number]>) => {
      const [surveyId, elemId] = action.payload;
      const surveyItem = state.surveyList.items.find(
        (item) => item.id == surveyId
      );
      if (surveyItem && surveyItem.data) {
        surveyItem.data.elements = surveyItem.data.elements.filter(
          (elem) => elem.id !== elemId
        );
      }
    },
    elementUpdated: (
      state,
      action: PayloadAction<[number, number, ZetkinSurveyElement]>
    ) => {
      const [surveyId, elemId, updatedElement] = action.payload;
      const surveyItem = state.surveyList.items.find(
        (item) => item.id == surveyId
      );
      if (surveyItem && surveyItem.data) {
        surveyItem.data.elements = surveyItem.data.elements.map((oldElement) =>
          oldElement.id == elemId ? updatedElement : oldElement
        );
      }
    },
    statsLoad: (state, action: PayloadAction<number>) => {
      const surveyId = action.payload;
      state.statsBySurveyId[surveyId] = remoteItem<SurveyStats>(surveyId, {
        isLoading: true,
      });
    },
    statsLoaded: (state, action: PayloadAction<[number, SurveyStats]>) => {
      const [surveyId, stats] = action.payload;
      state.statsBySurveyId[surveyId].data = stats;
      state.statsBySurveyId[surveyId].isLoading = false;
      state.statsBySurveyId[surveyId].loaded = new Date().toISOString();
    },
    submissionLoad: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const item = state.submissionList.items.find((item) => item.id == id);
      state.submissionList.items = state.submissionList.items
        .filter((item) => item.id != id)
        .concat([remoteItem(id, { data: item?.data, isLoading: true })]);
    },
    submissionLoaded: (
      state,
      action: PayloadAction<ZetkinSurveySubmission>
    ) => {
      // TODO: Segregate submission content from submission list
      const submission = action.payload;
      const item = state.submissionList.items.find(
        (item) => item.id == submission.id
      );
      if (!item) {
        throw new Error('Finished loading item that never started loading');
      }

      item.data = submission;
      item.isLoading = false;
      item.loaded = new Date().toISOString();
    },
    surveyLoad: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const item = state.surveyList.items.find((item) => item.id == id);
      state.surveyList.items = state.surveyList.items
        .filter((item) => item.id != id)
        .concat([remoteItem(id, { data: item?.data, isLoading: true })]);
    },
    surveyLoaded: (state, action: PayloadAction<ZetkinSurveyExtended>) => {
      const survey = action.payload;
      const item = state.surveyList.items.find((item) => item.id == survey.id);
      if (!item) {
        throw new Error('Finished loading item that never started loading');
      }

      item.data = survey;
      item.isLoading = false;
      item.loaded = new Date().toISOString();
    },
    surveysLoad: (state) => {
      state.surveyList.isLoading = true;
    },
    surveysLoaded: (state, action: PayloadAction<ZetkinSurveyExtended[]>) => {
      const surveys = action.payload;
      const timestamp = new Date().toISOString();
      state.surveyList = remoteList(surveys);
      state.surveyList.loaded = timestamp;
    },
    /* eslint-disable-next-line */
    surveySubmissionsLoad: (state, action: PayloadAction<number>) => {
      // TODO: Segregate submissions by survey ID
      state.submissionList.isLoading = true;
    },
    surveySubmissionsLoaded: (
      state,
      action: PayloadAction<[number, ZetkinSurveySubmission[]]>
    ) => {
      // TODO: Segregate submissions by survey ID
      const [, submissions] = action.payload;
      state.submissionList = remoteList(submissions);
      state.submissionList.loaded = new Date().toISOString();
    },
    surveyUpdate: (state, action: PayloadAction<[number, string[]]>) => {
      const [surveyId, mutating] = action.payload;
      const item = state.surveyList.items.find((item) => item.id == surveyId);
      if (item) {
        item.mutating = mutating;
      }
    },
    surveyUpdated: (state, action: PayloadAction<ZetkinSurvey>) => {
      const survey = action.payload;
      const item = state.surveyList.items.find((item) => item.id == survey.id);
      if (item) {
        item.data = { ...item.data, ...survey } as ZetkinSurveyExtended;
        item.mutating = [];
      }
    },
  },
});

export default surveysSlice;
export const {
  elementAdded,
  elementDeleted,
  elementUpdated,
  submissionLoad,
  submissionLoaded,
  statsLoad,
  statsLoaded,
  surveyLoad,
  surveyLoaded,
  surveySubmissionsLoad,
  surveySubmissionsLoaded,
  surveysLoad,
  surveysLoaded,
  surveyUpdate,
  surveyUpdated,
} = surveysSlice.actions;
