export interface Action<T = any> {
	type: T
}
  
export interface PayloadActionWithAction<T = any, Payload extends object = object> extends Action<T> {
	payload: {
		[Key in keyof Payload]: Payload[Key]
	}
}
export interface PayloadActionWithoutAction<T = any> extends Action<T> {
}

export type PayloadAction<T = any, Payload extends object | undefined = undefined> = Payload extends object ? PayloadActionWithAction<T, Payload> : PayloadActionWithoutAction<T>

export type Reducer<S = any, A extends Action = PayloadAction> = (
	state: S,
	action: A
) => void
