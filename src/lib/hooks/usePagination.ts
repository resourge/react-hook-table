import { useMemo, useRef } from 'react';

import {
	createNewUrlWithSearch,
	parseParams,
	SearchConfig,
	useSearchParams
} from '@resourge/react-search-params'

import { calculateTotalPages } from '../utils/calculateTotalPages';
import { navigate } from '../utils/setDefaultNavigation';

export type UsePaginationConfig = SearchConfig

export type PaginationParams = { page: number, perPage: number }

export type Pagination = PaginationParams & { totalItems: number, totalPages: number }

export type UsePaginationReturn = {
	/**
	 * Changes items per page
	 */
	changeItemsPerPage: (perPage: number) => void
	/**
	 * Changes current page
	 */
	changePage: (page: number, totalItems?: number) => void
	/**
	 * Changes both current page and items per page
	 */
	changePagination: (page: number, perPage: number) => void
	/**
	 * Changes total number of pages using total number of items
	 * * Note: It doesn't trigger render.
	 */
	changeTotalPages: (totalItems: number) => void
	/**
	 * Builds href for use on navigation. (usually used with pagination component)
	 */
	getPaginationHref: (page: number) => string
	pagination: Pagination
	/**
	 * Resets pagination to initial/default values
	 */
	resetPagination: () => void
	url: URL
}

export const usePagination = (
	defaultSearchParams?: PaginationParams,
	{ hash = false }: UsePaginationConfig = {
		hash: false 
	}
): UsePaginationReturn => {
	const [
		{
			params,
			url
		}, 
		setParams
	] = useSearchParams<PaginationParams>(
		navigate,
		defaultSearchParams,
		{
			hash
		}
	);

	const paginationRef = useRef({
		totalPages: 0,
		totalItems: 0 
	});

	const pagination = useMemo((): Pagination => ({
		perPage: params.perPage,
		page: params.page,
		totalPages: 0,
		totalItems: 0
	}), 
	[params.perPage, params.page])

	pagination.totalPages = paginationRef.current.totalPages;
	pagination.totalItems = paginationRef.current.totalItems;

	const _setParams = (newPagination: Partial<PaginationParams>) => {
		setParams({
			...params,
			...newPagination
		})
	}

	const changePage = (page: number) => {
		_setParams({
			page
		});
	};

	const changeTotalPages = (totalItems: number) => {
		const totalPages = calculateTotalPages(pagination.perPage, totalItems);

		paginationRef.current = {
			totalPages: totalPages ?? pagination.totalPages,
			totalItems
		}

		if ( totalPages < pagination.page ) {
			changePage(0)
		}
	}

	const changeItemsPerPage = (perPage: number) => {
		_setParams({
			perPage,
			page: 0
		});
	};
    
	const changePagination = (page: number, perPage: number) => {
		_setParams({
			perPage,
			page
		});
	};

	const resetPagination = () => {
		_setParams({
			page: 0,
			perPage: params.perPage
		});
	};

	const getPaginationHref = (page: number) => {
		const newSearch: string = parseParams({
			...params,
			page
		});

		return createNewUrlWithSearch(url, newSearch, hash).href;
	}

	return {
		url,
		pagination,

		changeTotalPages,
		changePage,
		changeItemsPerPage,
		changePagination,
		resetPagination,
		getPaginationHref
	}
}
