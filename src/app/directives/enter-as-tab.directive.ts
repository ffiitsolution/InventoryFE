// enter-as-tab.directive.ts
import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appEnterAsTab]'
})
export class EnterAsTabDirective {
  @HostListener('keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault(); // Prevent form submission
    const form = event.target as HTMLElement;
    const focusable = Array.from(document.querySelectorAll<HTMLElement>(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.hasAttribute('disabled') && el.tabIndex >= 0);

    const index = focusable.indexOf(form);
    if (index > -1 && index + 1 < focusable.length) {
      focusable[index + 1].focus();
    }
  }
}
