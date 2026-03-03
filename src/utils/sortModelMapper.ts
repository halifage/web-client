import type { SortModel as ProtoSortModel } from '../generated/grid_data_pb';
import { create } from '@bufbuild/protobuf';
import { SortModelSchema } from '../generated/grid_data_pb';

// AG Grid sort model type
interface AgSortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

/**
 * Maps AG Grid sort model to proto SortModel array
 */
export function mapSortModel(agSortModel: AgSortModel[] | null | undefined): ProtoSortModel[] {
  if (!agSortModel || agSortModel.length === 0) {
    return [];
  }

  return agSortModel.map((sortItem) =>
    create(SortModelSchema, {
      colId: sortItem.colId,
      sort: sortItem.sort,
    })
  );
}
