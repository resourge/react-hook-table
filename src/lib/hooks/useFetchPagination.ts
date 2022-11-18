/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { HttpService } from '@resourge/http-service'
import { useFetch, UseFetchEffect, UseFetchEffectConfig } from '@resourge/react-fetch'

import {
	FilterType,
	useFilter,
	UseFilterConfig,
	UseFilterDefaultValue,
	UseFilterReturn
} from './useFilter'
import {
	PaginationParams,
	usePagination,
	UsePaginationConfig,
	UsePaginationReturn
} from './usePagination'

export type UseFetchPaginationConfig = UsePaginationConfig & UseFilterConfig & Omit<UseFetchEffectConfig<any>, 'initialState'>

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
		error: UseFetchEffect<any, any>['error']
		isLoading: UseFetchEffect<any, any>['isLoading']
		/**
		 * Resets the pagination, sort and/or filter.
		 */
		reset: (newSearchParams?: Omit<UseFetchPaginationDefaultValues<Data, OrderColumn, Filter>, 'initialState'>) => void
		setData: UseFetchEffect<any, any>['setData']
	},
	/** 
	 * Refetch method.
	*/
	fetch: () => Promise<void>
]

export const useFetchPagination = <
	OrderColumn, 
	Data,
	Filter extends Record<string, any> = Record<string, any>
>(
	method: (
		http: typeof HttpService,
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
		async (http) => {
			const { data, totalItems } = await method(http, {
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
