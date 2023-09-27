/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useFetch, type UseFetchStateConfig } from '@resourge/react-fetch'
import { type UseFetchState } from '@resourge/react-fetch/dist/hooks/useFetch'

import {
	type FilterType,
	useFilterSearchParams,
	type UseFilterSearchParamsConfig,
	type UseFilterSearchParamsDefaultValue,
	type UseFilterSearchParamsReturn
} from './useFilterSearchParams'
import {
	type PaginationSearchParams,
	usePaginationSearchParams,
	type UsePaginationSearchParamsConfig,
	type UsePaginationSearchParamsReturn
} from './usePaginationSearchParams'

export type UsePaginationTableMeta<
	Filter extends Record<string, any> = Record<string, any>,
	OrderColumn = string, 
> = {
	pagination: PaginationSearchParams
} & UseFilterSearchParamsDefaultValue<Filter, OrderColumn> 

export type UsePaginationConfig<
	Data,
	OrderColumn = string, 
	Filter extends Record<string, any> = Record<string, any>
> = UseFilterSearchParamsDefaultValue<Filter, OrderColumn> & {
	pagination?: PaginationSearchParams
} 
& UseFetchStateConfig<Data> 
& UsePaginationSearchParamsConfig
& UseFilterSearchParamsConfig

export type UsePaginationReturn<
	Data,
	OrderColumn = string, 
	Filter extends Record<string, any> = Record<string, any>
> = {
	/**
	 * useFetchPagination Data
	 */
	data: Data
	error: UseFetchState<any, any>['error']
	/** 
	 * Redoes the fetch again.
	*/
	fetch: () => Promise<Data>
	isLoading: UseFetchState<any, any>['isLoading']
	/**
	 * Resets the pagination, sort and/or filter.
	 */
	reset: (newSearchParams?: Omit<UsePaginationConfig<Data, OrderColumn, Filter>, 'initialState'>) => void
	setPaginationState: UseFetchState<any, any>['setFetchState']
} 
& UsePaginationSearchParamsReturn 
& UseFilterSearchParamsReturn<Filter, OrderColumn> 

export const usePagination = <
	OrderColumn, 
	Data,
	Filter extends Record<string, any> = Record<string, any>
>(
	method: (
		tableMeta: UsePaginationTableMeta<Filter, OrderColumn>
	) => Promise<{ data: Data, totalItems?: number }>,
	{ 
		initialState,
		pagination: defaultPagination = {
			page: 0,
			perPage: 10
		},
		filter: _filter,
		sort: _sort,
		...config
	}: UsePaginationConfig<Data, OrderColumn, Filter>
): UsePaginationReturn<Data, OrderColumn, Filter> => {
	const { pagination, ...paginationMethods } = usePaginationSearchParams(
		defaultPagination, 
		config
	);
	const {
		url, filter, sort, ...filterMethods 
	} = useFilterSearchParams<Filter, OrderColumn>(
		{
			...defaultPagination,
			filter: _filter,
			sort: _sort
		}, 
		config
	);
	
	const {
		data,
		error,
		fetch,
		isLoading,
		setFetchState
	} = useFetch(
		async () => {
			const { data, totalItems } = await method({
				pagination,
				sort,
				filter
			});

			paginationMethods.changeTotalPages(totalItems ?? 0);

			return data
		},
		{
			initialState,
			...config,
			deps: config?.deps ? [pagination, filter, sort, ...config.deps] : [pagination, filter, sort]
		}
	)

	const reset = (newSearchParams?: Omit<UsePaginationConfig<Data, OrderColumn, Filter>, 'initialState'>) => {
		if ( newSearchParams ) {
			filterMethods.setFilter({
				...newSearchParams.pagination,
				...(newSearchParams.sort ?? {}),
				...newSearchParams.filter
			} as FilterType<OrderColumn, Filter>);
		}
	}

	return {
		data,
		error,
		isLoading,
		filter,
		sort,
		pagination,
		...paginationMethods,
		...filterMethods,
		setFilter: (newFilter: FilterType<OrderColumn, Filter>) => {
			filterMethods.setFilter({
				...newFilter,
				page: 0
			});
		},
		reset,
		setPaginationState: setFetchState,
		fetch
	}
}
