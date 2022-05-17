import { UseURLControllerConfig } from '../hooks/useURLController'

import { PaginationCriteria, PaginationController } from './PaginationController'
import { OrderByEnum, SortCriteria } from './SortCriteria'

export type SearchParamsFunctions<T extends Record<string, any>> = {
	/**
	 * Gets new path with search params
	 */
	getPathWithSearch: (searchParams: T) => string
	/**
	 * Updates search params
	 */
	setSearchParams: (setSearchParams: (searchParams: T) => void) => void
	/**
	 * Reset search params to initial/default values.
	 */
	resetSearchParams: (newSearchParams?: Partial<T>) => void
}

export type DefaultTableSearchParams<
	Order,
	Filter extends Record<string, any>
> = Partial<
	Filter
> & Partial<
	SortCriteria<Order> & 
	PaginationCriteria
>

export type TableSearchParams<Order, Filter extends Record<string, any>> = [
	DefaultTableSearchParams<Order, Filter>,
	{
		/**
		 * Changes which column to order asc/desc.
		 */
		sortTable: (
			order: OrderByEnum, 
			orderColumn: Order
		) => void
		/**
		 * Changes current page
		 */
		changePage: (page: number) => void
		/**
		 * Changes items per page
		 */
		changeItemsPerPage: (itemsPerPage: number) => void
		/**
		 * Changes both current page and items per page
		 */
		changePagination: (page: number, itemsPerPage: number) => void
		/**
		 * Method to updates filters.
		 */
		setFilter: (filter: Filter) => void
		/**
		 * Resets pagination to initial/default values
		 */
		resetPagination: () => void
	} & SearchParamsFunctions<DefaultTableSearchParams<Order, Filter>>
]

// #region useURLController
export type DefaultURLControllerSearchParams<
	Order,
	Filter extends Record<string, any>
> = {
	pagination?: PaginationCriteria
	filter?: Filter
	sort?: SortCriteria<Order>
} & UseURLControllerConfig

export type UrlController<
	Order,
	Filter extends Record<string, any>
> = [
	{
		pagination: PaginationController
		sort?: SortCriteria<Order>
		filter: Filter
	},
	{
		/**
		 * Builds href for use on navigation. (usually used with pagination component)
		 */
		getPaginationHref: (page: number) => string
		/**
		 * Forces a table refresh
		 */
		reForceUpdate: () => void
		/**
		 * Sets number of total items.
		 * * Note: Doesn't render the component
		 */
		setTotalItems: (totalItems?: number) => void
	} & TableSearchParams<Order, Filter>[1]
]
// #endregion useURLController

// #region useTable
export type HandleTableParams<
	Order, 
	Filter extends Record<string, any>
> = {
	pagination: PaginationController
	sort?: SortCriteria<Order>
	filter: Filter
}

export type TableState<
	State extends Record<string, any>, 
	Order, 
	Filter extends Record<string, any>
> = [
	UrlController<Order, Filter>[0] & State,
	UrlController<Order, Filter>[1] & {
		/**
		 * Resets the table data and total items.
		 */
		reset: (state: State, totalItems?: number) => void
		/**
		 * Handles the server request to populate the table.
		 */
		handleTable: (
			setTable: (config: HandleTableParams<Order, Filter>) => void | Promise<void>, 
			deps?: React.DependencyList
		) => () => Promise<void>
	}
]

// #endregion useTable
