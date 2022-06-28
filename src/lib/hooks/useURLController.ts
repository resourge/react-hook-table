/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useMemo, useRef } from 'react'

import { PaginationController } from '../types/PaginationController'
import { DefaultURLControllerSearchParams, DefaultTableSearchParams, UrlController } from '../types/types';

import { useTableSearchParams, UseTableSearchParamsConfig } from './useTableSearchParams';

export type UseURLControllerConfig = UseTableSearchParamsConfig

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
		const _page = page ?? 0
		paginationRef.current.criteria = {
			page: paginationRef.current.totalPages >= _page ? _page : 0,
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

	const reForceUpdate = () => {
		paginationRef.current = PaginationController.resetPagination(
			paginationRef.current.page,
			paginationRef.current.perPage,
			paginationRef.current.totalItems
		);

		changePagination(paginationRef.current.page, paginationRef.current.perPage);
	};

	const setTotalItems = (totalItems?: number) => {
		paginationRef.current.totalItems = totalItems ?? 0;
	}
	// #endregion Url Control
	
	return [
		{
			pagination: paginationRef.current,
			filter,
			sort
		},
		{
			getPaginationHref,
			reForceUpdate,
			setTotalItems,

			getPathWithSearch,
			changePagination,
			...methods
		}
	]
}
