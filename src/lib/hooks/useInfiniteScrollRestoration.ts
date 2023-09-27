/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

// import { ScrollRestorationIdIsUndefined } from '@resourge/react-fetch/dist/errors/ScrollRestorationIdIsUndefined';
import { type ElementWithScrollTo, useOnScroll } from '@resourge/react-fetch/dist/hooks/useOnScroll/useOnScroll';

type ScrollPos = {
	left: number
	top: number
}

type VisitedUrl = {
	page?: number
	perPage?: number
	pos?: ScrollPos
};

const visitedUrl = new Map<string, VisitedUrl>();

export interface InfiniteScrollRestoration {
	(behavior: ScrollBehavior): void
	getPage: () => VisitedUrl
	setPage: (page: number, perPage: number) => void
}

/**
 * Method to restore scroll.
 * If return `ref` is not set, it will assume window
 * @param scrollRestorationId 
 * @example
 * ```Typescript
  // useAction will probably be from a navigation/router package
  // Ex: import { useAction } from '@resourge/react-router';
  const action = useAction();
  // 'action' must be 'pop' for restoration to work;
  const [scrollRestoration, ref] = useInfiniteScrollRestoration(action);
  const {} = useInfiniteLoading(
      async () => {
          return HttpService.get("url")
      }, 
      {
          initialState: [],
          scrollRestoration
      }
  );
```
 */
export const useInfiniteScrollRestoration = <T extends ElementWithScrollTo | null>(
	/**
	 * Action defines if scroll restoration can be executed.
	 * Only on 'pop' will the scroll be restored.
	 */
	action: 'pop' | string,
	/**
	 * Unique id categorizing current component. Must be the same between render or component changes for scroll restoration to work.
	 */
	scrollRestorationId: string = window?.location?.pathname
) => {
	const canRestore = useRef(false);
	const [ref, onScroll] = useOnScroll<T>((pos) => {
		const existingRecord = visitedUrl.get(scrollRestorationId);

		visitedUrl.set(
			scrollRestorationId, 
			{
				...existingRecord,
				pos
			}
		);
	});

	useEffect(() => {
		canRestore.current = action === 'pop';
	}, [action]);

	useEffect(() => {
		if ( action !== 'pop' ) {
			visitedUrl.delete(scrollRestorationId);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const scrollRestoration = (behavior: ScrollBehavior = 'auto') => {
		if ( canRestore.current ) {
			const existingRecord = visitedUrl.get(scrollRestorationId);

			if ( existingRecord !== undefined && existingRecord.pos ) {
				window.requestAnimationFrame(() => {
					if ( ref.current ) {
						ref.current.scrollTo({
							...existingRecord.pos,
							behavior,
							animated: behavior === 'smooth'
						} as any);
					}
				});
				visitedUrl.delete(scrollRestorationId);
			}
		}
	};

	scrollRestoration.getPage = () => {
		return visitedUrl.get(scrollRestorationId);
	};

	scrollRestoration.setPage = (page: number, perPage: number) => {
		const existingRecord = visitedUrl.get(scrollRestorationId);

		visitedUrl.set(
			scrollRestorationId, 
			{
				pos: existingRecord?.pos,
				page, 
				perPage
			}
		);
	};

	return [scrollRestoration as (behavior?: ScrollBehavior) => void, ref, onScroll] as const;
};
