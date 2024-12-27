import { Component, OnInit } from '@angular/core';
import { AnimateComponent } from '../../animate/animate.component';
import { CERT_CANVAS_OPTIONS, CERTS, TAG_CANVAS_OPTIONS, TAGS } from 'src/app/constants';
import { ICert, ITag } from 'src/app/interfaces';
import { TagCanvasModule, TagCanvasOptions } from 'ng-tagcanvas';

@Component({
  selector: 'app-certs',
  standalone: true,
  imports: [TagCanvasModule],
  templateUrl: './certs.component.html',
  styleUrl: './certs.component.scss'
})
export class CertsComponent extends AnimateComponent implements OnInit{
  override animationDelay = 2000;

  options: TagCanvasOptions = CERT_CANVAS_OPTIONS;
  screenWidth!: number;
  certs: ICert[] = CERTS;

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
  }

  openCertPdf(pdfSrc: string): void {
    // const baseUrl = window.location.origin;
    // const fullUrl = `${baseUrl}/${pdfSrc}`;
    window.open(pdfSrc, '_blank');
  }
}
