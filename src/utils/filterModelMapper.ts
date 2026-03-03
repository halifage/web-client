import type { FilterModel as ProtoFilterModel } from '../generated/grid_data_pb';
import { create } from '@bufbuild/protobuf';
import { FilterModelSchema } from '../generated/grid_data_pb';

// AG Grid filter model types
interface TextFilterModel {
  filterType: 'text';
  type: string; // equals, notEqual, contains, notContains, startsWith, endsWith
  filter?: string;
}

interface NumberFilterModel {
  filterType: 'number';
  type: string; // equals, notEqual, lessThan, lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange
  filter?: number;
  filterTo?: number;
}

interface SetFilterModel {
  filterType: 'set';
  values: string[];
}

type AgFilterModel = TextFilterModel | NumberFilterModel | SetFilterModel;

/**
 * Maps AG Grid filter model to proto FilterModel array
 */
export function mapFilterModel(agFilterModel: Record<string, unknown> | null | undefined): ProtoFilterModel[] {
  if (!agFilterModel) {
    return [];
  }

  const filters: ProtoFilterModel[] = [];

  for (const [field, value] of Object.entries(agFilterModel)) {
    if (!value || typeof value !== 'object') continue;

    const filterModel = value as AgFilterModel;
    const protoFilter = create(FilterModelSchema, { field });

    if ('filterType' in filterModel) {
      if (filterModel.filterType === 'text') {
        protoFilter.filterType = filterModel.type;
        protoFilter.filter = filterModel.filter ?? '';
      } else if (filterModel.filterType === 'number') {
        protoFilter.filterType = filterModel.type;
        protoFilter.filter = filterModel.filter?.toString() ?? '';
        if (filterModel.type === 'inRange' && filterModel.filterTo !== undefined) {
          protoFilter.filterTo = filterModel.filterTo.toString();
        }
      } else if (filterModel.filterType === 'set') {
        protoFilter.filterType = 'set';
        protoFilter.values = filterModel.values;
      }
    }

    filters.push(protoFilter);
  }

  return filters;
}
