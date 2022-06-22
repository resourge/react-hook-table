import { SearchNavigate } from '@resourge/react-search-params';

export let navigate: SearchNavigate = ({ url }) => window.history.replaceState(null, '', url.href)

export const setDefaultNavigation = (newNavigate: SearchNavigate) => {
	navigate = newNavigate;
}
