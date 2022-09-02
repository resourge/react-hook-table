import { OrderByEnum } from '../types/SortCriteria'
import { TableSearchParams, DefaultTableSearchParams } from '../types/types';

import { useSearchParams, UseSearchParamsConfig } from './useSearchParams';

export type UseTableSearchParamsConfig = UseSearchParamsConfig

export const useTableSearchParams = <
	Order,
	Filter extends Record<string, any>
>(
	defaultTableSearchParams: DefaultTableSearchParams<Order, Filter>,
	config?: UseTableSearchParamsConfig
): TableSearchParams<Order, Filter> => {
	const [
		params, 
		{
			getPathWithSearch,
			setSearchParams,
			resetSearchParams
		}
	] = useSearchParams<DefaultTableSearchParams<Order, Filter>>(defaultTableSearchParams, config);

	const sortTable = (
		orderBy: OrderByEnum, 
		orderColumn: Order
	) => {
		setSearchParams((searchParams) => {
			searchParams.orderBy = orderBy;
			// @ts-expect-error Says type Order is not equal to type Order 
			searchParams.orderColumn = orderColumn
			searchParams.page = 0;
		});
	};

	const changePage = (page: number) => {
		setSearchParams((searchParams) => {
			searchParams.page = page;
		});
	};

	const changeItemsPerPage = (itemsPerPage: number) => {
		setSearchParams((searchParams) => {
			searchParams.perPage = itemsPerPage;
			searchParams.page = 0;
		});
	};
    
	const changePagination = (page: number, itemsPerPage: number) => {
		setSearchParams((searchParams) => {
			searchParams.perPage = itemsPerPage;
			searchParams.page = page;
		});
	};
    
	const setFilter = (filter: Filter) => {
		setSearchParams((searchParams) => {
			(Object.keys(filter) as Array<keyof Filter>)
			.forEach((key: keyof Filter) => {
				searchParams[key] = filter[key];
			});

			searchParams.page = 0;
		});
	};

	const resetPagination = () => {
		const newSearchParams: any = {
			page: 0,
			perPage: params.perPage
		}

		resetSearchParams(newSearchParams)
	};

	return [
		params,
		{
			// #region useSearchParams methods
			getPathWithSearch,
			setSearchParams,
			resetSearchParams,
			// #endregion useSearchParams methods

			sortTable,
			changePage,
			changeItemsPerPage,
			changePagination,
			setFilter,
			resetPagination
		}
	]
}
