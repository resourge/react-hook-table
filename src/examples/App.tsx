import { useState } from 'react'

import { useFetchPagination } from '../lib'

type Product = {
	id: number
	name: string
}

function App() {
	const [random, setRandom] = useState(Math.random);

	const [
		products,
		{ changeItemsPerPage },
		manually
	] = useFetchPagination<'', Product[]>(
		async () => {
			return await Promise.resolve({
				data: [
					{
						id: Math.random(),
						name: 'Apple' 
					}
				],
				totalItems: 10	
			})
		},
		{
			initialState: []
		},
		{
			deps: [random]
		}
	)

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setRandom2] = useState(Math.random);

	return (
		<>
			<button onClick={() => setRandom(Math.random())}>
				Update deps
			</button>
			<button onClick={() => setRandom2(Math.random())}>
				Update component 
			</button>
			<button onClick={manually}>
				Update manually
			</button>
			<button onClick={() => {
				changeItemsPerPage(100)
			}}
			>
				Change Items per page to 100
			</button>
			<table>
				<tbody>
					{
						products.map((product, index) => (
							<tr key={`${index}`}>
								<td>
									{ product.id }
									{' '}
								</td>
								<td>
									{ product.name }
									{' '}
								</td>
							</tr>
						))
					}
				</tbody>
			</table>
		</>
	)
}

export default App
