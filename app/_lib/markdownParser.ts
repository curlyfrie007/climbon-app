// lib/markdownToHtml.js
import { remark } from 'remark';
import html from 'remark-html';
import { Compatible } from 'vfile';

export async function markdownToHtml(markdown: Compatible | undefined) {
    const result = await remark().use(html).process(markdown);
    return result.toString();
}