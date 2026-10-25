import { Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { marked } from 'marked';
import { MarkdownPipe } from './markdown.pipe';
import { SketchIcon } from './sketch-icon';
interface Post {
  id: number;
  title: string;
  content: string;
  images: string[];
  createdAt: string;
}
@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe, MarkdownPipe, SketchIcon],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private http = inject(HttpClient);
  darkMode = signal(document.documentElement.dataset['theme'] === 'dark');
  toggleTheme() {
    const theme = this.darkMode() ? 'light' : 'dark';
    this.darkMode.set(theme === 'dark');
    document.documentElement.dataset['theme'] = theme;
    try {
      localStorage.setItem('solano-theme', theme);
    } catch {
      /* Theme works when storage is unavailable. */
    }
  }
  posts = signal<Post[]>([]);
  selected = signal<Post | null>(null);
  admin = signal(false);
  view = signal<'home' | 'login' | 'editor'>('home');
  loading = signal(true);
  busy = signal(false);
  error = signal('');
  notice = signal('');
  images = signal<string[]>([]);
  @ViewChild('contentEditor') contentEditor?: ElementRef<HTMLTextAreaElement>;
  preview = signal(false);
  editingId = signal<number | null>(null);
  private cursor = 0;
  private selectionEnd = 0;
  rememberCursor() {
    const field = this.contentEditor?.nativeElement;
    if (field) {
      this.cursor = field.selectionStart;
      this.selectionEnd = field.selectionEnd;
    }
  }
  insertMarkdown(before: string, after = '', placeholder = '') {
    const start = Math.min(this.cursor, this.content.length);
    const end = Math.min(this.selectionEnd, this.content.length);
    const selected = this.content.slice(start, end) || placeholder;
    const inserted = before + selected + after;
    if (this.content.length - (end - start) + inserted.length > 100000) {
      this.error.set('O texto deve ter até 100.000 caracteres.');
      return;
    }
    this.content = this.content.slice(0, start) + inserted + this.content.slice(end);
    this.cursor = this.selectionEnd = start + inserted.length;
    this.preview.set(false);
    setTimeout(() => {
      const field = this.contentEditor?.nativeElement;
      field?.focus();
      field?.setSelectionRange(this.cursor, this.cursor);
    });
  }
  insertImage(url: string, alt = 'Descrição da foto') {
    this.insertMarkdown('\n\n![' + alt + '](' + url + ')\n\n');
  }
  unplacedImages = computed(() => {
    const post = this.selected();
    if (!post) return [];
    const used = new Set<string>();
    marked.walkTokens(marked.lexer(post.content), (token) => {
      if (token.type === 'image') used.add(token.href);
    });
    return post.images.filter((image) => !used.has(image));
  });
  edit(post: Post) {
    this.home();
    this.editingId.set(post.id);
    this.title = post.title;
    this.content = post.content;
    this.images.set([...post.images]);
    this.cursor = this.selectionEnd = this.content.length;
    this.preview.set(false);
    this.view.set('editor');
  }
  username = 'admin';
  password = '';
  title = '';
  content = '';
  constructor() {
    window.addEventListener('popstate', () => this.restoreLocation());
    void this.load().then(() => this.restoreLocation());
    void firstValueFrom(this.http.get('/api/me'))
      .then(() => this.admin.set(true))
      .catch(() => {});
  }
  async load() {
    this.loading.set(true);
    try {
      this.posts.set(await firstValueFrom(this.http.get<Post[]>('/api/posts')));
    } catch {
      this.error.set('Não foi possível carregar os textos. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
  restoreLocation() {
    const id = new URLSearchParams(location.search).get('post');
    this.selected.set(this.posts().find((p) => String(p.id) === id) || null);
    this.view.set(new URLSearchParams(location.search).get('autor') === '1' ? 'login' : 'home');
  }
  home() {
    history.pushState({}, '', location.pathname);
    this.selected.set(null);
    this.view.set('home');
    this.error.set('');
    this.notice.set('');
  }
  open(post: Post) {
    history.pushState({}, '', '?post=' + post.id);
    this.selected.set(post);
    this.view.set('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  loginView() {
    this.home();
    this.view.set('login');
  }
  newPost() {
    this.title = '';
    this.content = '';
    this.images.set([]);
    this.editingId.set(null);
    this.cursor = this.selectionEnd = 0;
    this.editor();
  }
  editor() {
    this.preview.set(false);
    this.home();
    this.view.set('editor');
  }
  async csrf() {
    await firstValueFrom(this.http.get('/api/csrf'));
  }
  async login() {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.csrf();
      await firstValueFrom(
        this.http.post(
          '/api/login',
          new HttpParams().set('username', this.username).set('password', this.password),
        ),
      );
      this.password = '';
      this.admin.set(true);
      await this.csrf();
      this.editor();
    } catch {
      this.error.set('Não foi possível entrar. Confira seu usuário e sua senha.');
    } finally {
      this.busy.set(false);
    }
  }
  async logout() {
    try {
      await this.csrf();
      await firstValueFrom(this.http.post('/api/logout', {}));
      this.admin.set(false);
      this.home();
    } catch {
      this.error.set('Não foi possível sair. Tente novamente.');
    }
  }
  removeImage(image: string) {
    this.content = this.content.replace(/!\[[^\]]*\]\(([^)]+)\)/g, (match, url: string) =>
      url === image ? '' : match,
    );
    this.images.update((items) => items.filter((item) => item !== image));
    this.cursor = this.selectionEnd = Math.min(this.cursor, this.content.length);
  }
  async upload(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (this.images().length + files.length > 12) {
      this.error.set('Você pode adicionar até 12 fotos.');
      input.value = '';
      return;
    }
    this.preview.set(false);
    this.busy.set(true);
    this.error.set('');
    try {
      await this.csrf();
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) throw new Error('Cada foto deve ter até 10 MB.');
        const data = new FormData();
        data.append('file', file);
        const result = await firstValueFrom(this.http.post<{ url: string }>('/api/images', data));
        this.images.update((imgs) => [...imgs, result.url]);
        this.insertImage(result.url, file.name.replace(/[\[\]\r\n]/g, ' ').replace(/\.[^.]+$/, ''));
      }
    } catch (e) {
      this.error.set(
        e instanceof Error && !(e instanceof HttpErrorResponse)
          ? e.message
          : 'Não foi possível enviar a foto. Use JPEG ou PNG, com até 10 MB.',
      );
    } finally {
      this.busy.set(false);
      input.value = '';
    }
  }
  async publish() {
    if (!this.title.trim() || !this.content.trim()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.csrf();
      const payload = { title: this.title, content: this.content, images: this.images() };
      const post = await firstValueFrom(
        this.editingId() === null
          ? this.http.post<Post>('/api/posts', payload)
          : this.http.put<Post>('/api/posts/' + this.editingId(), payload),
      );
      const updated = this.editingId() !== null;
      this.editingId.set(null);
      this.title = '';
      this.content = '';
      this.images.set([]);
      await this.load();
      this.open(post);
      this.notice.set(updated ? 'Postagem atualizada.' : 'Seu texto foi publicado.');
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 401) {
        this.admin.set(false);
        this.error.set('Sua sessão terminou. Entre novamente para publicar.');
        this.view.set('login');
      } else this.error.set('Não foi possível publicar. Seu rascunho continua aqui.');
    } finally {
      this.busy.set(false);
    }
  }
  async remove(post: Post) {
    if (!window.confirm('Excluir “' + post.title + '”? Esta ação não pode ser desfeita.')) return;
    this.busy.set(true);
    try {
      await this.csrf();
      await firstValueFrom(this.http.delete('/api/posts/' + post.id));
      this.home();
      await this.load();
      this.notice.set('Postagem excluída.');
    } catch {
      this.error.set('Não foi possível excluir a postagem.');
    } finally {
      this.busy.set(false);
    }
  }
}
