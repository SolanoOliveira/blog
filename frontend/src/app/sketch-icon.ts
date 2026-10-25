import { Component, input } from '@angular/core';
/** Original SVG paths: deliberately irregular, like quick pen sketches. */
@Component({
  selector: 'app-sketch-icon',
  standalone: true,
  template: `<svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    stroke-width="1.65"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    @switch (name()) {
      @case ('sun') {
        <path
          d="M22.5 12c-5-8-15 0-10 7.5 4 6 14-.5 10-7.5ZM16 2l.5 4M28 7l-3 3M30 19l-4-1M23 29l-2-4M10 28l2-4M2 20l4-1M4 7l4 3"
        />
      }
      @case ('moon') {
        <path d="M20 3C7 4 3 19 13 26c6 4 14 0 16-7-8 4-18-5-9-16Z" />
        <path d="m26 4 .5 3 3 .5-3 1-.5 3-1-3-3-.5 3-1Z" />
      }
      @case ('image') {
        <path d="m4 7 24-1 1 22-25-1L4 7Zm1 16 7-8 6 7 5-5 5 8" />
        <path d="M23 10c-4-2-5 4-1 4 3 0 3-3 1-4Z" />
      }
      @case ('pen') {
        <path d="m7 22 16-18c2-2 7 2 5 4L11 26l-7 2 3-6Zm13-15 5 5M7 22l4 4M4 30l24-1" />
      }
      @case ('arrow') {
        <path d="M4 17c7-2 15-1 23-2M19 7l9 8-8 10" />
      }
      @case ('back') {
        <path d="M28 16c-7 1-15 0-23 1M13 7l-9 9 10 9" />
      }
      @case ('eye') {
        <path d="M2 16C10 4 23 5 30 16c-8 13-20 12-28 0Z" />
        <path d="M19 12c-6-5-10 6-4 8 6 2 9-6 4-8Z" />
      }
      @case ('close') {
        <path d="m8 7 17 18M24 7 7 25" />
      }
      @default {
        <path d="m8 4 14 1 4 6-1 17-19-1L8 4Zm13 1-1 7 6-1M11 16l10-1M11 21l7 1" />
        <path d="m2 9 2 2M28 3l-1 3" />
      }
    }
  </svg>`,
  styles: [
    ':host{display:inline-flex;width:1.3em;height:1.3em;flex-shrink:0;vertical-align:middle}svg{width:100%;height:100%}',
  ],
})
export class SketchIcon {
  name = input('page');
}
