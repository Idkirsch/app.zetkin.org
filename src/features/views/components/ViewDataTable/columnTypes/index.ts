import { GridColDef } from '@mui/x-data-grid-pro';

import LocalPersonColumnType from './LocalPersonColumnType';
import LocalQueryColumnType from './LocalQueryColumnType';
import SimpleColumnType from './SimpleColumnType';
import SurveyResponseColumnType from './SurveyResponseColumnType';
import SurveySubmittedColumnType from './SurveySubmittedColumnType';
import { COLUMN_TYPE, ZetkinViewColumn } from 'features/views/components/types';

export interface IColumnType<
  ColumnType = ZetkinViewColumn,
  CellType = unknown
> {
  cellToString(cell: CellType, column: ColumnType): string;
  getColDef(column: ColumnType): Omit<GridColDef, 'field'>;
}

// TODO: Remove this once all real types have been implemented
class DummyColumnType implements IColumnType {
  cellToString(): string {
    return '';
  }

  getColDef(): Omit<GridColDef, 'field'> {
    return {};
  }
}

/* ============================================================================
 * Getting an error here? READ THIS!
 * ----------------------------------------------------------------------------
 * The columnTypes object contains a mapping between view column type and
 * an object which configures the various aspects of a view column.
 *
 * If you're getting a typescript error here after creating a new view column
 * type, it's probably because you have not yet implemented an object for it.
 *
 * This is intentional! It's easy to forget adding an object here, so we have
 * have implemented this logic in a way that causes typescript to report an
 * error if any of the COLUMN_TYPE values does not have a corresponding class.
 *
 * Copy one of the existing ones, and change it's implementation to handle
 * the value correctly.
 */
const columnTypes: Record<COLUMN_TYPE, IColumnType> = {
  [COLUMN_TYPE.JOURNEY_ASSIGNEE]: new DummyColumnType(),
  [COLUMN_TYPE.LOCAL_BOOL]: new SimpleColumnType(),
  [COLUMN_TYPE.LOCAL_PERSON]: new LocalPersonColumnType(),
  [COLUMN_TYPE.LOCAL_QUERY]: new LocalQueryColumnType(),
  [COLUMN_TYPE.PERSON_FIELD]: new SimpleColumnType(),
  [COLUMN_TYPE.PERSON_NOTES]: new DummyColumnType(),
  [COLUMN_TYPE.PERSON_QUERY]: new LocalQueryColumnType(),
  [COLUMN_TYPE.PERSON_TAG]: new DummyColumnType(),
  [COLUMN_TYPE.SURVEY_OPTIONS]: new DummyColumnType(),
  [COLUMN_TYPE.SURVEY_RESPONSE]: new SurveyResponseColumnType(),
  [COLUMN_TYPE.SURVEY_SUBMITTED]: new SurveySubmittedColumnType(),
  [COLUMN_TYPE.LOCAL_TEXT]: new SimpleColumnType(),
};

export default columnTypes;