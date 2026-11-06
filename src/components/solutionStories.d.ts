export const SOLUTION_STORIES: Record<string, unknown>;
export function createStoryMarkup(slug: string): string;
export function createServiceSelector(preview?: boolean): string;
export function mountSolutionStory(root: HTMLElement): () => void;
