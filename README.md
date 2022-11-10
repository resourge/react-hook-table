# React-hook-table

`react-hook-table` is a hook with a set of tools to help to control a table. The hook provides control over sorting, pagination and filtering while updating the url search params to maintain consistency over page updates. 

## Features

- Uses @resourge/react-fetch
- Saves filters, pagination and sorting on search params.
- Provides a set of methods to help maintain and control a table pagination, sorting and filtering.
- Provides methods to connect the navigation with other packages. (ex: react-router)
- [parseParams](###), [parseSearch](###parseSearch) method's that extend URLSearchParams for own use.


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

```Typescript
const [
  data, // Variable containing "data"
  {
    changeItemsPerPage, changePage, sortTable, 
    setFilter, getPaginationHref,
    filter, sort, pagination
    // Pagination Methods as well as filter/sort/pagination
  }
  getFetch // Method to re-fetch
] = useFetchPagination(
  async ({ pagination, sort, filter }) => {
    const { data, pagination: { totalItems } } = await fetch(...)
      
    return {
      data,
      totalItems
    }
  },
  {
    initialState: [],
	/*
	  // Default values
      filter,
	  sort,
	  pagination
	*/
  },
  {
	deps: [] // Extra dependencies
  }
)
```

## Quickstart

```jsx
import React from 'react';
import { useTable } from '@resourge/react-hook-table';

export default function Form() {
  const [
    products, // Variable containing "data"
    {
      changeItemsPerPage, changePage, sortTable, 
      setFilter, getPaginationHref,
      filter, sort, pagination
      // Pagination Methods as well as filter/sort/pagination
    }
    getFetch // Method to re-fetch
  ] = useFetchPagination(
    async ({ pagination, sort, filter }) => {
      // fetch...
        
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
    },
    {
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

```Typescript
const [...] = useFetchPagination(
  fetchMethod,
  data,
  config
)
```

### Config

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| **fetchMethod** | `Promise` | true | Method that return the Data and totalItems. |
| **data** | `{ initialState: any, filter?: object, hash?: boolean, pagination?: PaginationCriteria, sort?: SortCriteria }` | false | Config to set initial/default filter, pagination and sort and initialState. <br> When hash is true it will use `Location hash` instead of `Location pathname` to get `search |
| **config** | `UseFetchConfig` | true | Config for @resourge/react-fetch. |

## Methods

### changeItemsPerPage

Changes items per page

```Typescript
const [
  ...
  {
    changeItemsPerPage
  }
] = useFetchPagination(...)
```

### changePage

Changes current page

```Typescript
const [
  ...
  {
    changePage
  }
] = useFetchPagination(...)
```

### changePagination

Changes both current page and items per page

```Typescript
const [
  ...
  {
	changePagination
  }
] = useFetchPagination(...)
```

### getPaginationHref

Builds href for use on navigation. (usually used with pagination component)

```Typescript
const [
  ...
  {
    getPaginationHref
  }
] = useFetchPagination(...)
```

### getPathWithSearch

Gets new path with search params

```Typescript
const [
  ...
  {
	getPathWithSearch
  }
] = useFetchPagination(...)
```

### reForceUpdate

Forces a table refresh

```Typescript
const [
  ...
  {
	reForceUpdate
  }
] = useFetchPagination(...)
```

### resetPagination

Resets pagination to initial/default values

```Typescript
const [
  ...
  {
    resetPagination
  }
] = useFetchPagination(...)
```

### resetSearchParams

Reset search params to initial/default values.

```Typescript
const [
  ...
  {
    resetSearchParams
  }
] = useFetchPagination(...)
```

### setFilter

Method to updates filters.

```Typescript
const [
  ...
  {
	setFilter
  }
] = useFetchPagination(...)
```

### setTotalItems

Sets number of total items.
_Note: Doesn't render the component_

```Typescript
const [
  ...
  {
    setTotalItems
  }
] = useFetchPagination(...)
```

### setSearchParams

Updates search params

```Typescript
const [
  ...
  {
    setSearchParams
  }
] = useFetchPagination(...)
```

### sortTable

Changes which column to order asc/desc.

```Typescript
const [
  ...
  {
    sortTable
  }
] = useFetchPagination(...)
```

### createLocation

Creates `SearchLocation` from a `path` or `Location`


```jsx
import { createLocation } from '@resourge/react-hook-table';

createLocation(location)

createLocation('/products?productId=10#hash')
```

### createPath

Creates path from `SearchLocation`

```jsx
import { createPath } from '@resourge/react-hook-table';

createPath(searchLocation)
```

### parseParams

Params object into search path

```jsx
import { parseParams } from '@resourge/react-hook-table';

parseParams({
  productId: 10,
  productName: 'Apple'
})
// ?productId=10&productName=Apple
```

### parseSearch

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