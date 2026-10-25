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
        <path d="M23 15c1 5-3 9-8 8-6-.6-8-8-4-12 4-5 12-2 12 4Z" />
        <path
          d="M10 11c-1 3 0 7 3 9M15 2l.5 3M25 6l-2 2M30 16l-4-.5M25 27l-2-3M15 30l.5-4M4 26l3-3M2 15l4 .5M5 5l3 3"
        />
        <path d="m27 2 1 1M2 22l1-.5" stroke-width="1.2" />
      }
      @case ('moon') {
        <path d="M19 4C8 2 2 15 9 24c5 7 16 5 20-3-9 3-17-7-10-17Z" />
        <path d="M8 16c.5 5 4 9 8 9M11 12l1-1" stroke-width="1.2" />
        <path d="m25 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1ZM28 14l1 .5M5 5l1-1" />
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
