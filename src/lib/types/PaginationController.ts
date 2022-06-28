export const calculateTotalPages = (perPage: number, totalItems: number = 0) => Math.ceil(totalItems / perPage) || 1;

export type PaginationCriteria = {
	/**
	 * Current page
	 */
	page: number
	/**
	 * Number of items per page
	 */
	perPage: number
}

export class PaginationController {
	/**
	 * Pagination criteria, object to send to the server.
	 */
	public criteria: PaginationCriteria = {
		page: 0,
		perPage: 10
	}
    
	/**
	 * Number of items per page
	 */
	public get perPage(): number {
		return this.criteria.perPage;
	}

	/**
	 * Current page
	 */
	public get page(): number {
		return this.criteria.page;
	}

	/**
	 * Total number of pages
	 */
	public get totalPages() {
		return calculateTotalPages(this.perPage, this.totalItems);
	}

	/**
	 * Total number of items.
	 */
	public totalItems: number = 0

	/**
	 * Resets pagination
	 * @param page - current page
	 * @param perPage - number of items per page
	 * @param totalItems - total number of items
	 * @returns 
	 */
	public static resetPagination(
		page: number,
		perPage: number,
		totalItems: number
	) {
		const newPagination = new PaginationController();

		newPagination.criteria = {
			page: page,
			perPage: perPage
		}

		newPagination.totalItems = totalItems;

		return newPagination;
	}
}
