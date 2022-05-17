import React, { useRef, useState } from 'react';

import { DefaultURLControllerSearchParams, HandleTableParams, TableState } from '../types/types';

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

	const requestRef = useRef<(params: HandleTableParams<Order, Filter>) => void | Promise<void>>();

	const depsRef = useRef<any[]>([]);

	const reset = (state: State, totalItems?: number) => {
		if ( totalItems !== undefined ) {
			setTotalItems(totalItems);
		}
		setState(state);
	}

	const handleTable = (
		request: (params: HandleTableParams<Order, Filter>) => void | Promise<void>,
		deps?: React.DependencyList
	) => {
		requestRef.current = request;
		const newDeps = [
			...(deps ?? []),
			filter, 
			pagination.criteria, 
			sort
		];

		if ( 
			depsRef.current.length !== newDeps.length ||
			depsRef.current.some((dep, index) => dep !== newDeps[index])
		) {
			request({
				pagination,
				sort,
				filter
			});

			depsRef.current = newDeps;
		}

		return async () => {
			await request({
				pagination,
				sort,
				filter
			});
		}
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
			handleTable,
			setTotalItems,
			...methods
		}
	];
}
