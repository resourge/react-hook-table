/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useMemo } from 'react';

import { type SearchConfig, useSearchParams } from '@resourge/react-search-params';

import { type OrderByEnum, type SortCriteria } from '../types/SortCriteria';
import { navigate } from '../utils/setDefaultNavigation';

export type UseFilterSearchParamsConfig = Pick<SearchConfig<Record<string, any>>, 'hash'>

export type UseFilterSearchParamsDefaultValue<T extends Record<string, any>, OrderColumn = string> = {
	filter?: T
	sort?: SortCriteria<OrderColumn>
}

export type FilterType<
	OrderColumn, 
	T extends Record<string, any>
> = Partial<T & SortCriteria<OrderColumn>>

export type UseFilterSearchParamsReturn<Filter extends Record<string, any>, OrderColumn = string> = {
	filter: Filter
	/**
	 * Method to updates filters.
	 */
	setFilter: (newFilter: FilterType<OrderColumn, Filter>) => void
	/**
	 * Changes which column to order asc/desc.
	 */
	sortTable: (
		orderBy: OrderByEnum, 
		orderColumn: OrderColumn
	) => void
	url: URL
	sort?: SortCriteria<OrderColumn>
}

export const useFilterSearchParams = <Filter extends Record<string, any>, OrderColumn = string>(
	{
		filter: defaultFilter, sort: defaultSort, ...rest 
	}: UseFilterSearchParamsDefaultValue<Filter, OrderColumn>,
	{ hash = false }: UseFilterSearchParamsConfig = {
		hash: false 
	}
): UseFilterSearchParamsReturn<Filter, OrderColumn> => {
	const [
		{
			params,
			url
		}, 
		setParams
	] = useSearchParams<FilterType<OrderColumn, Filter>>(
		navigate,
		{
			...(defaultFilter ?? {}),
			...(defaultSort ?? {}),
			...rest
		} as FilterType<OrderColumn, Filter>,
		{
			hash,
			filterKeys: ['page', 'perPage']
		}
	);

	const {
		perPage,
		page, 

		orderBy,
		orderColumn,
		..._filter
	} = params;

	// This is to memorize filter and only change when search('?*') change.
	// eslint-disable-next-line react-hooks/exhaustive-deps 
	const filter = useMemo(() => _filter as unknown as Filter, [params]);

	const sort = useMemo(() => orderBy && orderColumn ? {
		orderBy,
		orderColumn
	} : undefined, [orderBy, orderColumn])

	const setFilter = (newFilter: FilterType<OrderColumn, Filter>) => {
		setParams({
			...params,
			...newFilter
		})
	};

	const sortTable = (
		orderBy: OrderByEnum, 
		orderColumn: OrderColumn
	) => {
		setParams({
			...params,
			orderBy,
			orderColumn
		});
	};

	return {
		url,
		sort,
		filter,
		setFilter,
		sortTable
	}
}
