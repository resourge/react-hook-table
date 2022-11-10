import {
	parseParams,
	useSearchParams as _useSearchParams,
	SearchConfig,
	createNewUrlWithSearch
} from '@resourge/react-search-params'

import { navigate } from '../utils/setDefaultNavigation';

export type UseSearchParamsConfig = SearchConfig

export type SearchParamsFunctions<T extends Record<string, any>> = {
	/**
	 * Gets new path with search params
	 */
	getPathWithSearch: (searchParams: T) => string
	/**
	 * Reset search params to initial/default values.
	 */
	resetSearchParams: (newSearchParams?: Partial<T>) => void
	/**
	 * Updates search params
	 */
	setSearchParams: (setSearchParams: (searchParams: T) => void) => void
}

export const useSearchParams = <T extends Record<string, any> = Record<string, any>>(
	defaultSearchParams: T,
	{ hash = false }: UseSearchParamsConfig = {
		hash: false 
	}
): [
	T,
	SearchParamsFunctions<T>
] => {
	const [
		{ 
			params,
			url
		}, 
		setParams
	] = _useSearchParams<T>(
		navigate,
		defaultSearchParams,
		{
			hash
		}
	)

	const getPathWithSearch = (state: T) => {
		const newSearch: string = parseParams(state);
		
		return createNewUrlWithSearch(url, newSearch, hash).href;
	}

	const setSearchParams = (setSearchParams: (searchParams: T) => void) => {
		const _params: T = {
			...params 
		};

		setSearchParams(_params)

		setParams(_params);
	};

	const resetSearchParams = (newSearchParams?: Partial<T>) => {
		const state: T = {
			...defaultSearchParams,
			...(newSearchParams ?? {})
		};

		setParams(state);
	}

	return [
		params,
		{
			getPathWithSearch,
			setSearchParams,
			resetSearchParams
		}
	];
}
