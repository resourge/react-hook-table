import { OutputPagination } from 'src/shared/models/RequestPagination';

import { UrlController } from './useUrlController/useUrlController';

export type BaseTableState<
	OrderBy, 
	State extends object,
	ExtraFunctions extends { [key: string]: Function }
> = [
	UrlController<OrderBy>[0] & State,
	UrlController<OrderBy>[1] & {
		setPagination: (pagination: OutputPagination) => void
	} & ExtraFunctions
]
