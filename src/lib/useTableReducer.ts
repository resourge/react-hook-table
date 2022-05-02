import { useReducer, Reducer } from 'react';

import { BaseTableState } from './types';
import { PayloadAction } from './types/PayloadAction';
import { UrlControllerInitialState, useUrlController } from './useUrlController/useUrlController';

export type TableReducerState<
	OrderBy, 
	State extends Record<string, any>, 
	Action extends PayloadAction
> = BaseTableState<
	OrderBy,
	State,
	{
		dispatch: React.Dispatch<Action>
	}
>

export const useTableReducer = <
	OrderBy, 
	State extends Record<string, any>, 
	Action extends PayloadAction
> (
	reducer: Reducer<State, Action>, 
	initialState: State, 
	initialUrlState?: UrlControllerInitialState<OrderBy>
): TableReducerState<OrderBy, State, Action> => {
	const [
		{
			pagination,
			filter,
			sort
		},
		{
			getPaginationHref,
			reForceUpdate,
			setPagination,

			// #region useQueryParams functions
			getUrlWithQueryParams,
			setQueryParams,
			resetQueryParams,
			// #endregion useQueryParams functions

			// #region useTableQueryParams functions
			sortTable,
			changePage,
			changeItemsPerPage,
			changePagination,
			setFilter,
			resetPagination
			// #endregion useTableQueryParams functions
		}
	] = useUrlController(initialUrlState)

	const [state, dispatch] = useReducer(
		reducer,
		initialState
	);

	return [
		{
			...state,
			pagination,
			sort,
			filter
		},
		{
			dispatch,
			setPagination,
			
			getPaginationHref,
			reForceUpdate,

			// #region useQueryParams functions
			getUrlWithQueryParams,
			setQueryParams,
			resetQueryParams,
			// #endregion useQueryParams functions

			// #region useTableQueryParams functions
			sortTable,
			changePage,
			changeItemsPerPage,
			changePagination,
			setFilter,
			resetPagination
			// #endregion useTableQueryParams functions
		}
	];
}
