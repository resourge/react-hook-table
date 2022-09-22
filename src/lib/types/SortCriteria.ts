
export const enum OrderByEnum {
	ASC = 1,
	DESC = 2
}

export type SortCriteria<T = string> = {
	orderBy: OrderByEnum
	orderColumn: T extends string ? string : keyof T
}
