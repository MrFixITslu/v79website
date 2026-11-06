import { useEffect, useMemo, useRef } from 'react';
import { createStoryMarkup, createServiceSelector, mountSolutionStory } from './solutionStories';
import './solutionStories.css';

/** Only trusted, authored markup from solutionStories is rendered here. */
export function ServiceExperience({ slug }: { slug: string }) {
  const container = useRef<HTMLDivElement>(null);
  const markup = useMemo(() => createStoryMarkup(slug), [slug]);
  useEffect(() => {
    const root = container.current?.querySelector<HTMLElement>('[data-solution]');
    return root ? mountSolutionStory(root) : undefined;
  }, [slug]);
  return <div ref={container} key={slug} dangerouslySetInnerHTML={{ __html: markup }} />;
}

export function ServiceSelector() {
  return <nav aria-label="Explore V79 services" dangerouslySetInnerHTML={{ __html: createServiceSelector() }} />;
}
