import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/** Markdown is always sanitized; never bypass Angular's HTML security. */
@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  transform(source: string, mode: 'html' | 'text' = 'html'): string {
    const parsed = marked.parse(source, { gfm: true, breaks: true, async: false });
    const safe = DOMPurify.sanitize(parsed, {
      ALLOWED_TAGS:
        mode === 'text'
          ? []
          : [
              'p',
              'br',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'strong',
              'em',
              'del',
              'blockquote',
              'ul',
              'ol',
              'li',
              'a',
              'img',
              'pre',
              'code',
              'hr',
              'table',
              'thead',
              'tbody',
              'tr',
              'th',
              'td',
            ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'start'],
    });
    if (mode === 'text') {
      const doc = new DOMParser().parseFromString(safe, 'text/html');
      return doc.body.textContent || '';
    }
    return safe;
  }
}
