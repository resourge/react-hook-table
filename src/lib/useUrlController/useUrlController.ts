import { useMemo, useRef } from 'react';

import { OutputPagination, RequestPagination } from 'src/shared/models/RequestPagination';
import { SortCriteria } from 'src/shared/types/api/SortCriteria';

import { TableQueryParams, useTableQueryParams } from '../useTableQueryParams/useTableQueryParams';

export type UrlControllerInitialState<
	OrderBy
> = {
	sort?: SortCriteria<OrderBy>['sort']
}

export type UrlController<
	OrderBy
> = [
	{
		pagination: RequestPagination
		sort?: SortCriteria<OrderBy>['sort']
		filter: Omit<TableQueryParams<OrderBy>[0], 'page' | 'perPage' | 'orderBy' | 'orderColumn'>
	},
	{
		/**
		 * Gets a link for pagination
		 */
		getPaginationHref: (page: number) => string
		/**
		 * Forces a table refresh
		 */
		reForceUpdate: () => void
		/**
		 * Set Pagination
		 * * Note: Doesn't render the component
		 */
		setPagination: (pagination?: OutputPagination) => void
	} & TableQueryParams<OrderBy>[1]
]

export const useUrlController = <
	OrderBy
>(
	initialState?: UrlControllerInitialState<OrderBy>
): UrlController<OrderBy> => {
	// #region Url Control
	const paginationRef = useRef(new RequestPagination())

	const [
		params, 
		{
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
	] = useTableQueryParams<OrderBy>({
		...paginationRef.current.pagination,
		...(initialState?.sort ?? {})
	});

	const {
		page,
		perPage,

		orderBy,
		orderColumn,

		..._filter
	} = params;

	if ( 
		paginationRef.current.pagination.page !== page ||
		paginationRef.current.pagination.perPage !== perPage
	) {
		paginationRef.current.pagination = {
			page,
			perPage
		}
	}

	const sort = useMemo(() => orderBy && orderColumn ? {
		orderBy,
		orderColumn
	} : undefined, [orderBy, orderColumn])

	// This is to memorize filter and only change when search('?*') change.
	// eslint-disable-next-line react-hooks/exhaustive-deps 
	const filter = useMemo(() => _filter as Omit<TableQueryParams<OrderBy>[0], 'page' | 'perPage' | 'orderBy' | 'orderColumn'>, [params]);

	const getPaginationHref = (page: number) => {
		const url = getUrlWithQueryParams({
			...params,
			page
		})

		return url;
	}

	const reForceUpdate = () => {
		paginationRef.current = RequestPagination.resetPagination(
			paginationRef.current.page,
			paginationRef.current.perPage,
			paginationRef.current.totalItems
		);

		changePagination(paginationRef.current.page, paginationRef.current.perPage);
	};

	const setPagination = (pagination?: OutputPagination) => {
		if ( pagination ) {
			paginationRef.current.setPaginationByOutputPagination(pagination);
		}
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
	]
}
