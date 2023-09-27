import { type SearchParams } from '@resourge/react-search-params';

type SearchNavigate = <T extends Record<string, any> = Record<string, any>>(config: SearchParams<T>) => void

export let navigate: SearchNavigate = ({ url }) => {
	window.history.replaceState(null, '', url.href); 
}

export const setDefaultNavigation = (newNavigate: SearchNavigate) => {
	navigate = newNavigate;
}
