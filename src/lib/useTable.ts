import { useState } from 'react';

import { OutputPagination } from '../../models/RequestPagination';

import { BaseTableState } from './types';
import { UrlControllerInitialState, useUrlController } from './useUrlController/useUrlController';

export type TableState<
	OrderBy, 
	State extends object
> = BaseTableState<
	OrderBy,
	State,
	{
		setState: (state: State) => void
		setTable: (state: State, pagination: OutputPagination) => void
	}
>

export const useTable = <
	OrderBy, 
	State extends object
> (
	initialState: State, 
	initialUrlState?: UrlControllerInitialState<OrderBy>
): TableState<OrderBy, State> => {
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

	const [state, setState] = useState(initialState);

	const setTable = (state: State, pagination: OutputPagination) => {
		setPagination(pagination);

		setState(state);
	}

	return [
		{
			...state,
			pagination,
			sort,
			filter
		},
		{
			setState,
			setTable,
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
