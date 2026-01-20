import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found-404',
  imports: [RouterLink, TranslateModule],
  templateUrl: './not-found-404.component.html',
  styleUrl: './not-found-404.component.scss'
})
export class NotFound404Component {}
