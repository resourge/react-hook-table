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

export type UseFetchPaginationConfig = UsePaginationSearchParamsConfig & UseFilterSearchParamsConfig & Omit<UseFetchStateConfig<any>, 'initialState'>

export type UseFetchPaginationTableMeta<
	Filter extends Record<string, any> = Record<string, any>,
	OrderColumn = string, 
> = {
	pagination: PaginationSearchParams
} & UseFilterSearchParamsDefaultValue<Filter, OrderColumn> 

export type UseFetchPaginationDefaultValues<
	Data,
	OrderColumn = string, 
	Filter extends Record<string, any> = Record<string, any>
> = UseFilterSearchParamsDefaultValue<Filter, OrderColumn> & {
	initialState: Data
	pagination?: PaginationSearchParams
}

export type UseFetchPaginationReturn<
	Data,
	OrderColumn = string, 
	Filter extends Record<string, any> = Record<string, any>
> = [
	/**
	 * useFetchPagination Data
	 */
	data: Data,
	tableMeta: UsePaginationSearchParamsReturn & UseFilterSearchParamsReturn<Filter, OrderColumn> & {
		error: UseFetchState<any, any>['error']
		isLoading: UseFetchState<any, any>['isLoading']
		/**
		 * Resets the pagination, sort and/or filter.
		 */
		reset: (newSearchParams?: Omit<UseFetchPaginationDefaultValues<Data, OrderColumn, Filter>, 'initialState'>) => void
		setFetchState: UseFetchState<any, any>['setFetchState']
	},
	/** 
	 * Refetch method.
	*/
	fetch: () => Promise<Data>
]

/**
 * @deprecated use usePagination, simpler syntax
 */
export const useFetchPagination = <
	OrderColumn, 
	Data,
	Filter extends Record<string, any> = Record<string, any>
>(
	method: (
		tableMeta: UseFetchPaginationTableMeta<Filter, OrderColumn>
	) => Promise<{ data: Data, totalItems?: number }>,
	{ 
		initialState,
		pagination: defaultPagination = {
			page: 0,
			perPage: 10
		},
		...defaultFilter 
	}: UseFetchPaginationDefaultValues<Data, OrderColumn, Filter>,
	config?: UseFetchPaginationConfig
): UseFetchPaginationReturn<Data, OrderColumn, Filter> => {
	const { pagination, ...paginationMethods } = usePaginationSearchParams(
		defaultPagination, 
		config
	);
	const {
		url, filter, sort, ...filterMethods 
	} = useFilterSearchParams<Filter, OrderColumn>(
		{
			...defaultPagination,
			...defaultFilter 
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

	const reset = (newSearchParams?: Omit<UseFetchPaginationDefaultValues<Data, OrderColumn, Filter>, 'initialState'>) => {
		if ( newSearchParams ) {
			filterMethods.setFilter({
				...newSearchParams.pagination,
				...(newSearchParams.sort ?? {}),
				...newSearchParams.filter
			} as FilterType<OrderColumn, Filter>);
		}
	}

	return [
		data,
		{
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
			setFetchState
		},
		fetch
	]
}
