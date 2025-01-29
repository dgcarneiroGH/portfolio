import { Component, OnInit } from '@angular/core';
import { AnimateComponent } from '../../animate/animate.component';
import { CERT_CANVAS_OPTIONS, CERTS } from 'src/app/constants';
import { ICert, ITag } from 'src/app/interfaces';
import { TagCanvasModule, TagCanvasOptions } from 'ng-tagcanvas';

@Component({
  selector: 'app-certs',
  standalone: true,
  imports: [TagCanvasModule],
  templateUrl: './certs.component.html',
  styleUrl: './certs.component.scss'
})
export class CertsComponent extends AnimateComponent implements OnInit {
  override animationDelay = 2000;

  private lastClickTime = 0;

  options: TagCanvasOptions = CERT_CANVAS_OPTIONS;
  screenWidth!: number;
  certs: ICert[] = CERTS;

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
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
}
