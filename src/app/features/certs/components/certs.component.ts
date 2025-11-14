import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TagCanvasOptions } from 'ng-tagcanvas';
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
    // TagCanvasModule,
    CommonModule,
    CertsFilterComponent,
    TranslateModule
    // ParallaxHeaderDirective
  ],
  templateUrl: './certs.component.html',
  styleUrl: './certs.component.scss'
})
export class CertsComponent implements OnInit {
  private lastClickTime = 0;

  tagCanvasOptions!: TagCanvasOptions;

  certs: Cert[] = CERTS;
  filteredCerts!: Cert[];
  certsFilter: CertFilter[] = CERTS_FILTER;

  showCanvas = true;

  @HostListener('window:resize')
  onResize() {
    this.setResponsiveOptions();
    this._resetCanvas();
  }

  ngOnInit(): void {
    this.filteredCerts = this.certs;
    this.setResponsiveOptions();
  }

  setResponsiveOptions() {
    if (window.innerWidth < 660 || window.innerHeight < 620) {
      this.tagCanvasOptions = {
        ...CERT_CANVAS_OPTIONS,
        radiusX: 2,
        radiusY: 2,
        radiusZ: 2
        // zoom: 0.7
      };
    } else {
      this.tagCanvasOptions = { ...CERT_CANVAS_OPTIONS };
    }
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
