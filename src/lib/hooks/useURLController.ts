/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useMemo, useRef } from 'react'

import { PaginationController } from '../types/PaginationController'
import { DefaultURLControllerSearchParams, DefaultTableSearchParams, UrlController, HandleTableParams } from '../types/types';

import { useTableSearchParams, UseTableSearchParamsConfig } from './useTableSearchParams';

export type UseURLControllerConfig = UseTableSearchParamsConfig

function isBooleanEqual(a: boolean, b: boolean): boolean {
	return !(Number(a) - Number(b));
}

export const useURLController = <
	Order,
	Filter extends Record<string, any>
>(
	initialUrlState?: DefaultURLControllerSearchParams<Order, Filter>,
	config?: UseURLControllerConfig
): UrlController<Order, Filter> => {
	// #region Url Control
	const paginationRef = useRef<PaginationController>() as React.MutableRefObject<PaginationController>;

	if ( !paginationRef.current ) {
		paginationRef.current = PaginationController.resetPagination(
			initialUrlState?.pagination?.page ?? 0,
			initialUrlState?.pagination?.perPage ?? 10,
			0
		)
	}

	const tableState: DefaultTableSearchParams<Order, Filter> = {
		...paginationRef.current.criteria,
		...initialUrlState?.filter,
		...initialUrlState?.sort
	} as DefaultTableSearchParams<Order, Filter>

	const [
		params, 
		{
			getPathWithSearch,
			changePagination,
			changePage,
			...methods
		}
	] = useTableSearchParams<Order, Filter>(tableState, config);

	const {
		page,
		perPage,

		orderBy,
		orderColumn,

		..._filter
	} = params;

	if ( 
		paginationRef.current.criteria.page !== page ||
		paginationRef.current.criteria.perPage !== perPage
	) {
		paginationRef.current.criteria = {
			page: page ?? 0,
			perPage: perPage ?? 10
		}
	}

	const sort = useMemo(() => orderBy && orderColumn ? {
		orderBy,
		orderColumn
	} : undefined, [orderBy, orderColumn])

	// This is to memorize filter and only change when search('?*') change.
	// eslint-disable-next-line react-hooks/exhaustive-deps 
	const filter = useMemo(() => _filter as unknown as Filter, [params]);

	const getPaginationHref = (page: number) => {
		const url = getPathWithSearch({
			...params,
			page
		})

		return url;
	}

	const setTotalItems = (totalItems?: number) => {
		paginationRef.current.totalItems = totalItems ?? 0;

		if ( paginationRef.current.totalPages < paginationRef.current.criteria.page ) {
			paginationRef.current.criteria.page = 0;
			changePage(0)
		}
	}

	const requestRef = useRef<(params: HandleTableParams<Order, Filter>) => void | Promise<void>>();

	const depsRef = useRef<any[]>([]);

	const handleTable = (
		request: (params: HandleTableParams<Order, Filter>) => void | Promise<void>,
		deps?: React.DependencyList
	) => {
		const pagination = paginationRef.current;

		requestRef.current = request;
		const newDeps: any[] = [
			...(deps ?? []),
			filter, 
			pagination.criteria, 
			sort
		];

		if ( 
			depsRef.current.length !== newDeps.length ||
			depsRef.current.some((dep, index) => {
				const newDep = newDeps[index]
				if ( dep !== newDep ) {
					return true;
				}
				if ( 
					typeof dep === 'number' && 
					typeof newDep === 'number' && 
					(isNaN(dep) && isNaN(newDep))
				) {
					return true;
				}
				if ( 
					(typeof dep === 'boolean' && typeof newDep === 'boolean' && !isBooleanEqual(dep, newDep))
				) {
					return true;
				}
				return false
			})
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

	const reForceUpdate = () => {
		if ( requestRef.current ) {
			const pagination = paginationRef.current;
			requestRef.current({
				pagination,
				sort,
				filter
			});
		}
	};
	// #endregion Url Control
	
	return [
		{
			pagination: paginationRef.current,
			filter,
			sort
		},
		{
			getPaginationHref,
			setTotalItems,

			getPathWithSearch,
			changePagination,
			changePage,
			handleTable,
			reForceUpdate,
			...methods
		}
	]
}
