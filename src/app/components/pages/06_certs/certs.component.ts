import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AnimateComponent } from '../../animate/animate.component';
import { CERT_CANVAS_OPTIONS, CERTS, CERTS_FILTER } from 'src/app/constants';
import { ICert, ICertFilter } from 'src/app/interfaces';
import { TagCanvasModule, TagCanvasOptions } from 'ng-tagcanvas';
import { FilterComponent } from '../../shared/filter/filter.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certs',
  standalone: true,
  imports: [TagCanvasModule, FilterComponent, CommonModule],
  templateUrl: './certs.component.html',
  styleUrl: './certs.component.scss'
})
export class CertsComponent extends AnimateComponent implements OnInit {
  private lastClickTime = 0;

  options: TagCanvasOptions = CERT_CANVAS_OPTIONS;

  certs: ICert[] = CERTS;
  filteredCerts!: ICert[];
  certsFilter: ICertFilter[] = CERTS_FILTER;

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
  detectDblClick(cert: ICert): void {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - this.lastClickTime;

    if (timeDifference < 300) this.onDblClick(cert);

    this.lastClickTime = currentTime;
  }

  onDblClick(cert: ICert): void {
    window.open(cert.url, '_blank');
  }

  filter() {
    this.filteredCerts = this.certs.filter((cert) => this.showCert(cert));
    this._resetCanvas();
  }

  showCert(cert: ICert): boolean {
    return !this.certsFilter.some((filter) =>
      filter.items.some(
        (item) => item.id === cert[filter.id as keyof ICert] && !item.selected
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
