import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-project',
  imports: [CommonModule, TranslateModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {
  @Input() coverImgSrc!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() url?: string = '';

  showMoreInfo: boolean = false;
  animationDelay: string = '0s';

  ngOnInit(): void {
    this.animationDelay = `${Math.random() * 5}s`;
  }

  toggleMoreInfo() {
    this.showMoreInfo = !this.showMoreInfo;
  }

  goTo() {
    if (this.url) window.open(this.url, '_blank');
  }
}
