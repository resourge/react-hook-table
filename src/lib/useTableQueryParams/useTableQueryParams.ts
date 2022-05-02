import { FilterCriteria } from 'src/components/filter/interfaces/FilterCriteria';
import { PaginationCriteria } from 'src/shared/models/RequestPagination';
import { OrderByEnum, SortCriteria } from 'src/shared/types/api/SortCriteria';

import { useQueryParams, QueryParamsFunctions } from '../useQueryParams/useQueryParams';

type DefaultTableQueryParams<OrderBy> = PaginationCriteria & Partial<
	SortCriteria<OrderBy>['sort'] & FilterCriteria
>;

export type TableQueryParams<OrderBy> = [
	DefaultTableQueryParams<OrderBy>,
	{
		/**
		 * Change orderby and orderColumn
		 */
		sortTable: (
			orderBy: OrderByEnum, 
			orderColumn: OrderBy
		) => void
		/**
		 * Change page number
		 */
		changePage: (page: number) => void
		/**
		 * Change items per page
		 */
		changeItemsPerPage: (itemsPerPage: number) => void
		/**
		 * Change page number and items per page 
		 */
		changePagination: (page: number, itemsPerPage: number) => void
		/**
		 * Updates Filters
		 */
		setFilter: (filter: FilterCriteria) => void
		/**
		 * Reset pagination to default values
		 */
		resetPagination: () => void
	} & QueryParamsFunctions<DefaultTableQueryParams<OrderBy>>
]

export const useTableQueryParams = <OrderBy>(defaultParams: DefaultTableQueryParams<OrderBy>): TableQueryParams<OrderBy> => {
	const [
		params, 
		{
			getUrlWithQueryParams,
			setQueryParams,
			resetQueryParams
		}
	] = useQueryParams<DefaultTableQueryParams<OrderBy>>(defaultParams);

	const sortTable = (
		orderBy: OrderByEnum, 
		orderColumn: OrderBy
	) => {
		setQueryParams((state) => {
			state.orderBy = orderBy;
			// @ts-expect-error
			state.orderColumn = orderColumn
			state.page = 0;
		});
	};

	const changePage = (page: number) => {
		setQueryParams((state) => {
			state.page = page;
		});
	};

	const changeItemsPerPage = (itemsPerPage: number) => {
		setQueryParams((state) => {
			state.perPage = itemsPerPage;
		});
	};
    
	const changePagination = (page: number, itemsPerPage: number) => {
		setQueryParams((state) => {
			state.perPage = itemsPerPage;
			state.page = page;
		});
	};
    
	const setFilter = (filter: FilterCriteria) => {
		setQueryParams((state) => {
			(Object.keys(filter) as Array<keyof FilterCriteria>)
			.forEach((key: keyof FilterCriteria) => {
				(state as any)[key] = filter[key];
			});

			state.page = 0;
		});
	};

	const resetPagination = () => {
		resetQueryParams({
			page: 0,
			perPage: params.perPage
		})
	};

	return [
		params,
		{
			// #region useQueryParams functions
			getUrlWithQueryParams,
			setQueryParams,
			resetQueryParams,
			// #endregion useQueryParams functions

			sortTable,
			changePage,
			changeItemsPerPage,
			changePagination,
			setFilter,
			resetPagination
		}
	]
}
