import { useState } from 'react';

import { DefaultURLControllerSearchParams, TableState } from '../types/types';

import { useURLController } from './useURLController';

export const useTable = <
	State extends Record<string, any>,
	Order = any,
	Filter extends Record<string, any> = Record<string, any>
>(
	defaultTableParams: State,
	initialUrlState?: DefaultURLControllerSearchParams<Order, Filter>
): TableState<State, Order, Filter> => {
	const _initialUrlState = initialUrlState ?? {};
	const [
		{
			pagination,
			filter,
			sort
		},
		{
			setTotalItems,
			...methods
		}
	] = useURLController<Order, Filter>(
		{
			filter: _initialUrlState.filter,
			pagination: _initialUrlState.pagination,
			sort: _initialUrlState.sort
		},
		{
			hash: _initialUrlState.hash
		}
	)

	const [state, setState] = useState<State>(defaultTableParams);

	const reset = (state: State, totalItems?: number) => {
		if ( totalItems !== undefined ) {
			setTotalItems(totalItems);
		}
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
			reset,
			setTotalItems,
			...methods
		}
	];
}
