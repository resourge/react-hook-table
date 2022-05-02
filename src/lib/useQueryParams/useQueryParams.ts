import { useMemo } from 'react';

import produce, { nothing, Draft } from 'immer';
import { useHistory, useLocation } from 'react-router';

import { HttpUtils } from 'src/shared/utils/HttpUtils';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type ValidRecipeReturnType<State> = State | void | undefined | (State extends undefined ? typeof nothing : never);

export type QueryParamsFunctions<T extends object = object> = {
	/**
	 * Gets Url with QueryParams
	 */
	getUrlWithQueryParams: (state: T) => string
	/**
	 * Function to change QueryParams
	 */
	setQueryParams: (queryParams: (draft: Draft<T>) => ValidRecipeReturnType<Draft<T>>) => void
	/**
	 * Function reset/add QueryParams
	 */
	resetQueryParams: (newResetParams?: T) => void
}

export const useQueryParams = <T extends object = object>(defaultParams: T): [
	T,
	QueryParamsFunctions<T>
] => {
	const location = useLocation();
	const { replace, createHref, location: historyLocation } = useHistory();
	const { search } = location

	const getUrlWithQueryParams = (state: T) => {
		const params: string = HttpUtils.serializeParams(state);

		let historyHref = createHref({
			...historyLocation,
			search: params
		})

		if ( historyLocation.pathname !== location.pathname ) {
			const oldLocationHref = createHref(location)
			const newLocationHref = createHref({
				...location,
				search: params
			})

			historyHref = createHref({
				...historyLocation,
				hash: historyLocation.hash.replace(oldLocationHref, newLocationHref)
			})
		}
		
		return historyHref;
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const params = useMemo(() => HttpUtils.getParams<T>(search, defaultParams), [search]);

	const onSetParams = (state: T) => {
		replace(getUrlWithQueryParams(state));
	}

	const setQueryParams = (queryParams: (draft: Draft<T>) => ValidRecipeReturnType<Draft<T>>) => {
		const state: T = produce(params, queryParams);

		onSetParams(state);
	};

	const resetQueryParams = (newResetParams?: T) => {
		const state: T = {
			...(HttpUtils.getParams<T>('', defaultParams) ?? {}),
			...(newResetParams ?? {})
		};

		onSetParams(state);
	}

	return [
		params,
		{
			getUrlWithQueryParams,
			setQueryParams,
			resetQueryParams
		}
	];
}
