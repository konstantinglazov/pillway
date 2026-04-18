import { Component } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'pw-root',
  standalone: false,
  template: `<router-outlet></router-outlet>`,
  styles: [],
})
export class AppComponent {
  constructor(readonly theme: ThemeService) {}
}
