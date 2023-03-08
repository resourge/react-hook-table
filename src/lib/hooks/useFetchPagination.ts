/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useFetch, type UseFetchStateConfig } from '@resourge/react-fetch'
import { type UseFetchState } from '@resourge/react-fetch/dist/hooks/useFetch'

import {
	type FilterType,
	useFilter,
	type UseFilterConfig,
	type UseFilterDefaultValue,
	type UseFilterReturn
} from './useFilter'
import {
	type PaginationParams,
	usePagination,
	type UsePaginationConfig,
	type UsePaginationReturn
} from './usePagination'

export type UseFetchPaginationConfig = UsePaginationConfig & UseFilterConfig & Omit<UseFetchStateConfig<any>, 'initialState'>

export type UseFetchPaginationTableMeta<
	Filter extends Record<string, any> = Record<string, any>,
	OrderColumn = string, 
> = {
	pagination: PaginationParams
} & UseFilterDefaultValue<Filter, OrderColumn> 

export type UseFetchPaginationDefaultValues<
	Data,
	OrderColumn = string, 
	Filter extends Record<string, any> = Record<string, any>
> = UseFilterDefaultValue<Filter, OrderColumn> & {
	initialState: Data
	pagination?: PaginationParams
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
	tableMeta: UsePaginationReturn & UseFilterReturn<Filter, OrderColumn> & {
		error: UseFetchState<any, any>['error']
		isLoading: UseFetchState<any, any>['isLoading']
		/**
		 * Resets the pagination, sort and/or filter.
		 */
		reset: (newSearchParams?: Omit<UseFetchPaginationDefaultValues<Data, OrderColumn, Filter>, 'initialState'>) => void
		setData: UseFetchState<any, any>['setData']
	},
	/** 
	 * Refetch method.
	*/
	fetch: () => Promise<Data>
]

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
	const { pagination, ...paginationMethods } = usePagination(
		defaultPagination, 
		config
	);
	const {
		url, filter, sort, ...filterMethods 
	} = useFilter<Filter, OrderColumn>(
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
		setData
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
			reset,
			setData
		},
		fetch
	]
}
