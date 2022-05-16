import { useState } from 'react'

import { useTable } from './lib'

type Product = {
	id: number
	name: string
}

function App() {
	const [
		{
			products
		},
		{
			handleTable, changeItemsPerPage, reset
		}
	] = useTable<{ products: Product[] }>(
		{
			products: []
		}
	)

	const [random, setRandom] = useState(Math.random);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setRandom2] = useState(Math.random);

	const manually = handleTable((params) => {
		console.log('handleTable params', JSON.stringify(params, null, 4))
		reset(
			{ 
				products: [
					{ id: Math.random(), name: 'Apple' }
				] 
			}, 
			10
		);
	}, [random])

	console.log('random', random)

	return (
		<>
			<button onClick={() => setRandom(Math.random())}>
				Update deps
			</button>
			<button onClick={() => setRandom2(Math.random())}>
				Update deps2
			</button>
			<button onClick={manually}>
				Update manually
			</button>
			<button onClick={() => {
				changeItemsPerPage(100)
			}}>
				Update manually
			</button>
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
		</>
	)
}

export default App
