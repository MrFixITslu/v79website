import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import AIPromptGuideLandingPage from '../components/AIPromptGuideLandingPage';
import { CourseDetailPage } from '../components/CourseDetailPage';
import { ArticleDetailPage } from '../components/ArticleDetailPage';
import '../index.css';

const mountedRoots = new WeakMap<HTMLElement, Root>();

function slugifyCourse(title: string): string {
  return (title || 'course').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'course';
}

function navigateSpa(path: string) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function unmount(container: HTMLElement) {
  const existing = mountedRoots.get(container);
  if (existing) {
    existing.unmount();
    mountedRoots.delete(container);
  }
}

export async function mount(container: HTMLElement) {
  let root = mountedRoots.get(container);
  if (!root) {
    root = createRoot(container);
    mountedRoots.set(container, root);
  }

  const path = location.pathname.replace(/\/+$/, '') || '/';
  const article = new URLSearchParams(location.search).get('article');

  if (article) {
    root.render(
      <ArticleDetailPage
        slug={article}
        onBack={() => navigateSpa('/resources')}
        onNavigate={(section) => navigateSpa('/' + section)}
        onSelectArticle={(slug) => navigateSpa('/resources?article=' + encodeURIComponent(slug))}
      />
    );
    return;
  }

  if (path === '/free-ai-prompting-guide') {
    document.title = 'Free AI Prompting Guide | V79 Digital';
    root.render(<AIPromptGuideLandingPage />);
    return;
  }

  if (path.startsWith('/course/')) {
    const slugOrId = path.slice('/course/'.length);
    const r = await fetch('/api/apps');
    if (!r.ok) throw Error('Courses unavailable');
    const rows = await r.json();
    const course = Array.isArray(rows)
      ? rows.find(
          (x: any) =>
            x.category === 'courses' &&
            (String(x.id) === slugOrId ||
              x.accessUrl === `/course/${slugOrId}` ||
              slugifyCourse(x.name) === slugOrId)
        )
      : undefined;

    if (course?.name) {
      document.title = `${course.name} | V79 Digital Academy`;
    }

    root.render(
      course ? (
        <CourseDetailPage course={course} onBack={() => navigateSpa('/apps/academy')} />
      ) : (
        <section className="inner-section container">
          <h1>Course unavailable</h1>
          <a href="/apps/academy">Explore Academy</a>
        </section>
      )
    );
    return;
  }

  root.render(
    <section className="inner-section container">
      <h1>Page unavailable</h1>
      <a href="/resources">Explore resources</a>
    </section>
  );
}
