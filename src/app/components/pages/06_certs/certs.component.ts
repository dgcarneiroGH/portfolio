import { Component, OnInit } from '@angular/core';
import { AnimateComponent } from '../../animate/animate.component';
import { CERT_CANVAS_OPTIONS, CERTS } from 'src/app/constants';
import { ICert } from 'src/app/interfaces';
import { TagCanvasModule, TagCanvasOptions } from 'ng-tagcanvas';
import { ToggleButtonComponent } from '../../shared/toggle-button/toggle-button.component';

@Component({
  selector: 'app-certs',
  standalone: true,
  imports: [TagCanvasModule, ToggleButtonComponent],
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

  check(event: Event) {
    console.log(event);
  }
}
