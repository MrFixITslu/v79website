import React from 'react';
import {createRoot} from 'react-dom/client';
import AIPromptGuideLandingPage from '../components/AIPromptGuideLandingPage';
import {CourseDetailPage} from '../components/CourseDetailPage';
import {ArticleDetailPage} from '../components/ArticleDetailPage';
import '../index.css';
export async function mount(container:HTMLElement){
 const root=createRoot(container),path=location.pathname;
 const article=new URLSearchParams(location.search).get('article');
 if(article){root.render(<ArticleDetailPage slug={article} onBack={()=>location.assign('/resources')} onNavigate={section=>location.assign('/'+section)} onSelectArticle={slug=>location.assign('/resources?article='+encodeURIComponent(slug))}/>);return;}
 if(path==='/free-ai-prompting-guide'){root.render(<AIPromptGuideLandingPage/>);return;}
 if(path.startsWith('/course/')){
  const r=await fetch('/api/apps');if(!r.ok)throw Error('Courses unavailable');
  const rows=await r.json(),course=rows.find((x:any)=>x.id===Number(path.split('/')[2])&&x.category==='courses');
  root.render(course?<CourseDetailPage course={course} onBack={()=>location.assign('/apps/academy')}/>:<section className="inner-section container"><h1>Course unavailable</h1><a href="/apps/academy">Explore Academy</a></section>);return;
 }
 root.render(<section className="inner-section container"><h1>Page unavailable</h1><a href="/resources">Explore resources</a></section>);
}
