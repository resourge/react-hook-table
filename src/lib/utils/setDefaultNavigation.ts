import { SearchNavigate } from '@resourge/react-search-params';

export let navigate: SearchNavigate = ({ location }) => window.history.replaceState(null, '', location.path)

export const setDefaultNavigation = (newNavigate: SearchNavigate) => {
	navigate = newNavigate;
}
