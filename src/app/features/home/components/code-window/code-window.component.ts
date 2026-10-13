import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-code-window',
  standalone: true,
  templateUrl: './code-window.component.html',
  styleUrls: ['./code-window.component.scss'],
  imports: [TranslateModule]
})
export class CodeWindowComponent {}
