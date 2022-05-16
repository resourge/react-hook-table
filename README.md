# React-hook-table

`react-hook-table` is a hook with a set of tools to help to control a table. The hook provides control over sorting, pagination and filtering while updating the url search params to maintain consistency over page updates. 

## Features

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

## Usage

```Typescript
const [
  {
    filter, pagination, sort, products
  },
  {
    changeItemsPerPage, changePage, changePagination,
    getPaginationHref, getPathWithSearch, reForceUpdate,
    resetPagination, resetSearchParams, setFilter,
    setTotalItems, setSearchParams, handleTable, sortTable, reset
  }
] = useTable(
  {
    products: []
  }
)
```

## Quickstart

```jsx
import React from 'react';
import { useTable } from '@resourge/react-hook-table';

export default function Form() {
  const [
    {
      filter, pagination, sort, products
    },
    {
      changeItemsPerPage, changePage, changePagination,
      getPaginationHref, getPathWithSearch, reForceUpdate,
      resetPagination, resetSearchParams, setFilter,
      setTotalItems, setSearchParams, handleTable, sortTable, reset
    }
  ] = useTable<{ products: Product[] }>(
    {
      products: []
    }
  )
  
  handleTable(({
	pagination,
	sort,
	filter
  }) => {
    console.log('pagination', pagination)
    console.log('sort', sort)
    console.log('filter', filter)
    
    reset(
      { 
        products: [
          { id: Math.random(), name: 'Apple' }
        ] 
      }, 
      10
    )
  })

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
const [...] = useTable(
  data,
  config
)
```

### Config

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| **data** | `object` | true | Object containing the table data. (ex: { products: [] }) |
| **config** | `{ filter?: object, hash?: boolean, pagination?: PaginationCriteria, sort?: SortCriteria }` | false | Config to set initial/default filter, pagination and sort. <br> When hash is true it will use `Location hash` instead of `Location pathname` to get `search |

## Methods

### handleTable

Handles the server request to populate the table.
It works like use effect with 2 params, a callback for the first param and `dependencies` for the second param.
Also returns a method to manually request.

```Typescript
const [
  ...
  {
    handleTable, reset
  }
] = useTable(...)

// Returns a method for manually request.
const requestManually = handleTable(({
  pagination,
  sort,
  filter
}) => {
  // Expects to call reset to update the table data

  reset(
    { 
      products: [
        { id: Math.random(), name: 'Apple' }
      ] 
    }, 
    10
  )
  // The second params works like useEffect dependencies.
  // But when undefined it will not be called on render
}, [])
```

### reset

Resets the table data and total items.

```Typescript
const [
  ...
  {
    reset
  }
] = useTable(...)
```

### changeItemsPerPage

Changes items per page

```Typescript
const [
  ...
  {
    changeItemsPerPage
  }
] = useTable(...)
```

### changePage

Changes current page

```Typescript
const [
  ...
  {
    changePage
  }
] = useTable(...)
```

### changePagination

Changes both current page and items per page

```Typescript
const [
  ...
  {
	changePagination
  }
] = useTable(...)
```

### getPaginationHref

Builds href for use on navigation. (usually used with pagination component)

```Typescript
const [
  ...
  {
    getPaginationHref
  }
] = useTable(...)
```

### getPathWithSearch

Gets new path with search params

```Typescript
const [
  ...
  {
	getPathWithSearch
  }
] = useTable(...)
```

### reForceUpdate

Forces a table refresh

```Typescript
const [
  ...
  {
	reForceUpdate
  }
] = useTable(...)
```

### resetPagination

Resets pagination to initial/default values

```Typescript
const [
  ...
  {
    resetPagination
  }
] = useTable(...)
```

### resetSearchParams

Reset search params to initial/default values.

```Typescript
const [
  ...
  {
    resetSearchParams
  }
] = useTable(...)
```

### setFilter

Method to updates filters.

```Typescript
const [
  ...
  {
	setFilter
  }
] = useTable(...)
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
] = useTable(...)
```

### setSearchParams

Updates search params

```Typescript
const [
  ...
  {
    setSearchParams
  }
] = useTable(...)
```

### sortTable

Changes which column to order asc/desc.

```Typescript
const [
  ...
  {
    sortTable
  }
] = useTable(...)
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