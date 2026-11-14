import {PAGES, META} from '../shared/website-design';
export {PAGES, META};
export function renderDesignPage(html:string, pathname:string, article?:unknown):string {
 const route=pathname.replace(/\/+$/,'')||'/';
 const content=typeof article==='string'?'<main class="container inner-section"><h1>V79 resources</h1><p>Loading article…</p></main>':PAGES[route]||'<main class="container inner-section"><p>Loading page…</p></main>';
 return html.replace('<!--V79_PAGE-->',content);
}
