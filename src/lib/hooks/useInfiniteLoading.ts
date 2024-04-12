/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useEffect, useRef } from 'react';

import { useFetch, type UseFetchStateConfig } from '@resourge/react-fetch';
import { type UseFetchState } from '@resourge/react-fetch/dist/hooks/useFetch';

import { calculateTotalPages } from '../utils/calculateTotalPages';

import {
	type FilterType,
	useFilterSearchParams,
	type UseFilterSearchParamsConfig,
	type UseFilterSearchParamsDefaultValue,
	type UseFilterSearchParamsReturn
} from './useFilterSearchParams'
import { type InfiniteScrollRestoration } from './useInfiniteScrollRestoration';
import { type UsePaginationSearchParamsReturn, type PaginationSearchParams } from './usePaginationSearchParams';

export type UseInfiniteLoadingTableMeta<
	Filter extends Record<string, any> = Record<string, any>,
	OrderColumn = string, 
> = {
	pagination: PaginationSearchParams
} & UseFilterSearchParamsDefaultValue<Filter, OrderColumn> 

export type UseInfiniteLoadingDefaultValues<
	Data,
	OrderColumn = string, 
	Filter extends Record<string, any> = Record<string, any>
> = UseFilterSearchParamsDefaultValue<Filter, OrderColumn> & {
	pagination?: PaginationSearchParams
} 
& UseFilterSearchParamsConfig
& UseFetchStateConfig<Data>

export type UseInfiniteLoadingReturn<
	Data extends any[],
	OrderColumn = string, 
	Filter extends Record<string, any> = Record<string, any>
> = UseFilterSearchParamsReturn<Filter, OrderColumn> & {
	readonly context: UseInfiniteLoadingReturn<Data, OrderColumn, Filter>
	data: Data
	error: UseFetchState<any, any>['error']
	/** 
	 * Fetch current pagination
	*/
	fetch: () => Promise<Data>
	/**
	 * If is last "page"
	 */
	isLast: boolean
	/**
	 * If last page is incomplete (itemPerPage 10 but the last page got less than 10)
	 */
	isLastIncomplete: boolean
	isLoading: UseFetchState<any, any>['isLoading']
	loadMore: () => void
	/** 
	 * Preload method.
	*/
	preload: () => void
	/**
	 * Resets the pagination, sort and/or filter.
	 */
	reset: (newSearchParams?: Omit<UseInfiniteLoadingDefaultValues<Data, OrderColumn, Filter>, 'initialState'>) => void

	setFetchState: UseFetchState<any, any>['setFetchState']
} & Pick<UsePaginationSearchParamsReturn, 'url' | 'changeItemsPerPage'>

const MINUTE_IN_MILLISECOND = 60000

type InternalDataRef<Data extends any[]> = {
	data: Data[]
	isFirstTime: boolean
	nextData: {
		method?: () => Promise<{
			data: Data
			totalItems?: number | undefined
		}>
		promise?: Promise<{
			data: Data
			totalItems?: number | undefined
		}>
		when?: Date
	}
	perPage: number
}

export const useInfiniteLoading = <
	Data extends any[],
	Filter extends Record<string, any> = Record<string, any>,
	OrderColumn = string
>(
	method: (
		tableMeta: UseInfiniteLoadingTableMeta<Filter, OrderColumn>
	) => Promise<{ data: Data, totalItems?: number }>,
	{ 
		initialState,
		pagination: defaultPagination = {
			page: 0,
			perPage: 10
		},
		filter: initialFilter,
		scrollRestoration,
		...config 
	}: UseInfiniteLoadingDefaultValues<Data, OrderColumn, Filter>
): UseInfiniteLoadingReturn<Data, OrderColumn, Filter> => {
	const _scrollRestoration: InfiniteScrollRestoration = scrollRestoration as InfiniteScrollRestoration;
	
	if ( process.env.NODE_ENV === 'development' ) {
		if ( _scrollRestoration && !_scrollRestoration.getPage ) {
			throw new Error('\'scrollRestoration\' needs to come from \'useInfiniteScrollRestoration\'. \'scrollRestoration\' from \'useScrollRestoration\' doesn\'t work')
		}
	}

	const paginationRef = useRef<{
		pagination: PaginationSearchParams
		totalItems: number
		totalPages: number
	}>({
		pagination: defaultPagination,
		totalPages: 0,
		totalItems: 0
	});
	const internalDataRef = useRef<InternalDataRef<Data>>({
		isFirstTime: true,
		data: [],
		nextData: { },
		perPage: defaultPagination.perPage 
	});

	const {
		filter, sort, setFilter, sortTable, url 
	} = useFilterSearchParams<Filter, OrderColumn>(
		{
			...defaultPagination,
			filter: initialFilter
		}, 
		config
	);

	const deps = config?.deps ? [filter, sort, ...config.deps] : [filter, sort];
	
	const fetchResult = useFetch(
		async () => {
			const scrollRestorationData = internalDataRef.current.isFirstTime && _scrollRestoration 
				? _scrollRestoration.getPage() 
				: undefined;
			internalDataRef.current.isFirstTime = false;

			const perPage = scrollRestorationData && scrollRestorationData.perPage !== undefined && scrollRestorationData.page !== undefined 
				? (scrollRestorationData.perPage * (scrollRestorationData.page + 1))
				: paginationRef.current.pagination.perPage;
			const page = scrollRestorationData 
				? 0 
				: paginationRef.current.pagination.page;
				
			paginationRef.current.pagination.page = scrollRestorationData?.page ?? paginationRef.current.pagination.page;

			const tableMeta = {
				pagination: {
					page,
					perPage 
				},
				sort,
				filter
			};

			const { data, totalItems } = await (
				// Finish "nextData" in case "nextData" has yet to finish
				internalDataRef.current.nextData.promise &&
				internalDataRef.current.nextData.when && 
				Date.now() - internalDataRef.current.nextData.when.getTime() <= MINUTE_IN_MILLISECOND
					? internalDataRef.current.nextData.promise
					// Normal get
					: method(tableMeta)
			);

			internalDataRef.current.data[tableMeta.pagination.page] = data;

			// If outside dependencies change reset infiniteLoading page
			paginationRef.current.pagination.page = tableMeta.pagination.page;
			changeTotalPages(totalItems ?? 0);

			// Preload next "page"
			const newData = internalDataRef.current.data.flat() as Data;
			internalDataRef.current.nextData = {};
			if ( 
				totalItems && 
				totalItems > tableMeta.pagination.perPage && 
				!(newData.length !== ((paginationRef.current.pagination.page + 1) * paginationRef.current.pagination.perPage))
			) { 
				internalDataRef.current.nextData.method = () => method({
					pagination: {
						page: tableMeta.pagination.page + 1,
						perPage: tableMeta.pagination.perPage
					},
					filter: tableMeta.filter,
					sort: tableMeta.sort
				});
			}

			if ( _scrollRestoration ) {
				_scrollRestoration.setPage(paginationRef.current.pagination.page, paginationRef.current.pagination.perPage);
			}

			return newData;
		},
		{
			initialState,
			...config,
			scrollRestoration,
			deps
		}
	);

	useEffect(() => {
		internalDataRef.current.data = [];
		internalDataRef.current.nextData = {};
		paginationRef.current.pagination.page = 0;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps)

	const changeItemsPerPage = (perPage: number) => {
		paginationRef.current.pagination.perPage = perPage;
		paginationRef.current.pagination.page = 0;
		internalDataRef.current.data = [];

		fetchResult.fetch();
	};

	const changePage = (page: number) => {
		paginationRef.current.pagination.page = page;

		fetchResult.fetch();
	};

	const changeTotalPages = (totalItems: number) => {
		const totalPages = calculateTotalPages(paginationRef.current.pagination.perPage, totalItems);
		paginationRef.current.totalPages = totalPages ?? paginationRef.current.totalPages;
		paginationRef.current.totalItems = totalItems;
		if (totalPages < paginationRef.current.pagination.page) {
			changePage(0);
		}
	};

	const preload = () => {
		if ( internalDataRef.current.nextData.method ) {
			if (
				!internalDataRef.current.nextData.when || (
					internalDataRef.current.nextData.when && 
					Date.now() - internalDataRef.current.nextData.when.getTime() > MINUTE_IN_MILLISECOND
				)
			) {
				internalDataRef.current.nextData.promise = internalDataRef.current.nextData.method();
				internalDataRef.current.nextData.when = new Date();
			}
		}
	};

	const isLastIncomplete = internalDataRef.current.isFirstTime ? false : (fetchResult.data.length !== ((paginationRef.current.pagination.page + 1) * paginationRef.current.pagination.perPage));

	const loadMore = () => {
		if ( isLastIncomplete ) {
			fetchResult.fetch();
			return;
		}
		changePage(paginationRef.current.pagination.page + 1);
	};

	const reset = (newSearchParams?: Omit<UseInfiniteLoadingDefaultValues<Data, OrderColumn, Filter>, 'initialState'>) => {
		if ( newSearchParams ) {
			paginationRef.current.pagination = {
				...(newSearchParams.pagination ? newSearchParams.pagination : defaultPagination) 
			};
			setFilter({
				...(newSearchParams.sort ?? {}),
				...newSearchParams.filter
			} as FilterType<OrderColumn, Filter>);
		}
	};

	const _context: UseInfiniteLoadingReturn<Data, OrderColumn, Filter> = {
		data: fetchResult.data,
		preload,
		isLast: paginationRef.current.pagination.page >= (paginationRef.current.totalPages - 1),
		get error() {
			return fetchResult.error
		},
		get isLoading() {
			return fetchResult.isLoading
		},
		filter,
		sort,
		isLastIncomplete,
		changeItemsPerPage,
		loadMore,
		sortTable,
		url,
		setFilter,
		reset,
		setFetchState: fetchResult.setFetchState,
		fetch: fetchResult.fetch,
		get context() {
			return _context;
		}
	};

	return _context;
};
