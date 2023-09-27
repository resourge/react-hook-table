# React-hook-table

`react-hook-table` is a hook with a set of tools to help to control a table. The hook provides control over sorting, pagination and filtering while updating the url search params to maintain consistency over page updates. 

## Features

- Uses @resourge/react-fetch
- Saves filters, pagination and sorting on search params.
- Provides a set of methods to help maintain and control a table pagination, sorting and filtering.
- Provides methods to connect the navigation with other packages. (ex: react-router)
- [parseParams](###), [parseSearch](###parseSearch) method's that extend URLSearchParams for own use.
- useInfiniteLoading


## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add @resourge/react-hook-table
```

or NPM:

```sh
npm install @resourge/react-hook-table --save
```

## (optional) Setup navigation

By default, `@resourge/react-hook-table` uses native javascript history to update the URL. This can create a problem with packages that don't connect to native javascript history, for example `react-router`.

To fix this do:

```Typescript
import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

// This functions connects the @resourge/react-hook-table to the react-router history
setDefaultNavigation(({ location }) => history.replace(location.path))
```

This connects `react-router` navigation with `@resourge/react-hook-table` 

## Usage

```jsx
import React from 'react';
import { usePagination } from '@resourge/react-hook-table';

export default function List() {
  const {
    data: products, // Variable containing 'data'
	filter,
	error,
	isLoading,
	pagination,
	sort,

    fetch, // Method to re-fetch

	setFilter,
	changeItemsPerPage, 
	changePage, 
	changePagination, 
	changeTotalPages, 
	getPaginationHref,
	reset,
	resetPagination,
	setPaginationState,
	sortTable
  } = usePagination(
    async ({ pagination, sort, filter }) => {
      // fetch... use Http
        
      return await Promise.resolve({
        data: [
          { id: Math.random(), name: 'Apple' }
        ],
        totalItems: 10
      })
    },
    {
      initialState: [],
  	  /*
  	    // Default values
          filter,
  	    sort,
  	    pagination
  	  */
  	  deps: [] // Extra dependencies
    }
  )

  return (
    <table>
      <tbody>
        {
          products.map((product, index) => (
            <tr key={`${index}`}>
        	  <td>{ product.id } </td>
        	  <td>{ product.name } </td>
			</tr>
          ))
        }
      </tbody>
    </table>
  )
}
```

## Config

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| **fetchMethod** | `Promise` | true | Method that return the Data and totalItems. |
| **config** | `{ initialState: any, filter?: object, hash?: boolean, pagination?: PaginationCriteria, sort?: SortCriteria } & UseFetchConfig` | true | Config to set initial/default filter, pagination and sort and initialState. <br> When hash is true it will use `Location hash` instead of `Location pathname` to get `search. UseFetchConfig from @resourge/react-fetch. |

### filter

Pagination Filters

### pagination

Pagination per page and items per page

### sort

Pagination sort

### fetch

Method to refetch the current pagination

```Typescript
const {
  ...
  fetch
} = usePagination(...)
```
### setFilter

Method to updates filters.

```Typescript
const {
  ...
  setFilter
} = usePagination(...)
```

### changeItemsPerPage

Changes items per page

```Typescript
const {
  ...
  changeItemsPerPage
} = usePagination(...)
```

### changePage

Changes current page

```Typescript
const {
  ...
  changePage
} = usePagination(...)
```

### changePagination

Changes both current page and items per page

```Typescript
const {
  ...
  changePagination
} = usePagination(...)
```

### changeTotalPages

Changes total number of pages using total number of items
_Note: It doesn't trigger render._

```Typescript
const {
  ...
  changeTotalPages
} = usePagination(...)
```

### getPaginationHref

Builds href for use on navigation. (usually used with pagination component)

```Typescript
const {
  ...
  getPaginationHref
} = usePagination(...)
```

### reset

Resets the pagination, sort and/or filter.

```Typescript
const {
  ...
  reset
} = usePagination(...)
```

### resetPagination

Resets pagination to initial/default values

```Typescript
const {
  ...
  resetPagination
} = usePagination(...)
```


### setPaginationState

To set pagination state manually

```Typescript
const {
  ...
  setPaginationState
} = usePagination(...)
```

### sortTable

Changes which column to order asc/desc.

```Typescript
const {
  ...
  sortTable
} = usePagination(...)
```

## useInfiniteLoading


### Usage

```jsx
import React from 'react';
import { useInfiniteLoading, RefreshControl } from '@resourge/react-hook-table';

export default function List() {
  const {
    data: products, // Variable containing 'data'
	filter,
	error,
	isLoading,
	sort,

	context,
	isLast,
	isLastIncomplete,

	loadMore,
	preload,
    fetch, // Method to re-fetch

	setFilter,
	changeItemsPerPage, 
	reset,
	setPaginationState,
	sortTable
  } = useInfiniteLoading(
    async ({ pagination, sort, filter }) => {
      // fetch... use Http
        
      return await Promise.resolve({
        data: [
          { id: Math.random(), name: 'Apple' }
        ],
        totalItems: 10
      })
    },
    {
      initialState: [],
  	  /*
  	    // Default values
          filter,
  	    sort,
  	    pagination
  	  */
  	  deps: [] // Extra dependencies
    }
  )

  return (
    <table>
      <tbody>
        {
          products.map((product, index) => (
            <tr key={`${index}`}>
        	  <td>{ product.id } </td>
        	  <td>{ product.name } </td>
			</tr>
          ))
        }
		<tr>
		  <td>
            <RefreshControl 
              context={context}
              renderComponent={({ isLastIncomplete, onClick }) => (
                !isLastIncomplete 
                  ? (
                    <button
                     disabled={isLoading}
                     onClick={onClick}
                    >Get more</button>
                  ) : null
              )}
            />
		  </td>
		</tr>
      </tbody>
    </table>
  )
}
```

### context

Contains all the from useInfiniteLoading. (Works with RefreshControl)

```Typescript
const {
  ...
  loadMore
} = usePagination(...)
```

### isLast

If is last 'page'

```Typescript
const {
  ...
  isLast
} = usePagination(...)
```

### isLastIncomplete

If last 'page' is incomplete (itemPerPage 10 but the last page got less than 10)

```Typescript
const {
  ...
  isLastIncomplete
} = usePagination(...)
```

### loadMore

Method to load more 'pages'

```Typescript
const {
  ...
  loadMore
} = usePagination(...)
```

### preload

Method to preload the next 'page

```Typescript
const {
  ...
  preload
} = usePagination(...)
```

## useInfiniteScrollRestoration

Method to restore scroll in infinite scroll.

```Typescript
// useAction will probably be from a navigation/router package
// Ex: import { useAction } from '@resourge/react-router';
const action = useAction();
// 'action' must be 'pop' for restoration to work;
const [scrollRestoration, ref] = useInfiniteScrollRestoration(action);
const {} = useInfiniteLoading(
  ..., 
  {
    initialState: [],
    scrollRestoration
  }
);
```

## RefreshControl

Component to help useInfiniteScroll control the scroll.


```jsx
import React from 'react';
import { useInfiniteLoading, RefreshControl } from '@resourge/react-hook-table';

export default function List() {
  const {
    //...
	context,

  } = useInfiniteLoading(
    async ({ pagination, sort, filter }) => {
      // fetch... use Http
        
      return await Promise.resolve({
        data: [
          { id: Math.random(), name: 'Apple' }
        ],
        totalItems: 10
      })
    },
    {
      initialState: [],
  	  deps: [] // Extra dependencies
    }
  )

  return (
    <>
      ...
      <RefreshControl 
        context={context}
        renderComponent={({ isLastIncomplete, onClick }) => (
          !isLastIncomplete 
          ? (
            <button
              disabled={isLoading}
              onClick={onClick}
            >Get more</button>
          ) : null
        )}
      />
    </>
  )
}
```

## parseParams

Params object into search path

```jsx
import { parseParams } from '@resourge/react-hook-table';

parseParams({
  productId: 10,
  productName: 'Apple'
})
// ?productId=10&productName=Apple
```

## parseSearch

Converts search string into object.

```jsx
import { parseSearch } from '@resourge/react-hook-table';

parseSearch('?productId=10&productName=Apple')
// {
//   productId: 10,
//   productName: 'Apple'
// }
```

## License

MIT Licensed.