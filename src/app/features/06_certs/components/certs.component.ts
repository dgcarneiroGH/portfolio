import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TagCanvasModule, TagCanvasOptions } from 'ng-tagcanvas';
import { AnimateDirective } from 'src/app/shared/directives/animate.directive';
import { ParallaxHeaderDirective } from 'src/app/shared/directives/parallax-header.directive';
import {
  CERT_CANVAS_OPTIONS,
  CERTS,
  CERTS_FILTER
} from '../constants/certs.constants';
import { Cert, CertFilter } from '../interfaces/certs.interface';
import { CertsFilterComponent } from './certs-filter/certs-filter.component';

@Component({
  selector: 'app-certs',
  standalone: true,
  imports: [
    TagCanvasModule,
    CommonModule,
    CertsFilterComponent,
    TranslateModule,
    AnimateDirective,
    ParallaxHeaderDirective
  ],
  templateUrl: './certs.component.html',
  styleUrl: './certs.component.scss'
})
export class CertsComponent implements OnInit {
  private lastClickTime = 0;

  options: TagCanvasOptions = CERT_CANVAS_OPTIONS;

  certs: Cert[] = CERTS;
  filteredCerts!: Cert[];
  certsFilter: CertFilter[] = CERTS_FILTER;

  showCanvas = true;

  ngOnInit(): void {
    this.filteredCerts = this.certs;
  }

  downloadPdf(pdf: string): void {
    const link = document.createElement('a');
    link.href = `'assets/certs/pdfs/${pdf}`;
    link.download = pdf;
    link.click();
  }

  // To avoid errors detecting double click on canvas
  detectDblClick(cert: Cert): void {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - this.lastClickTime;

    if (timeDifference < 300) this.onDblClick(cert);

    this.lastClickTime = currentTime;
  }

  onDblClick(cert: Cert): void {
    window.open(cert.url, '_blank');
  }

  filter() {
    this.filteredCerts = this.certs.filter((cert) => this.showCert(cert));
    this._resetCanvas();
  }

  showCert(cert: Cert): boolean {
    return !this.certsFilter.some((filter) =>
      filter.items.some(
        (item) => item.id === cert[filter.id as keyof Cert] && !item.selected
      )
    );
  }

  private _resetCanvas() {
    this.showCanvas = false;
    setTimeout(() => {
      this.showCanvas = true;
    }, 300);
  }
}
