import { Component } from '@angular/core';
import { AnimateComponent } from 'src/app/core/components/animate/animate.component';
import { ProyectComponent } from 'src/app/features/05_proyects/components/proyect/proyect.component';
import { PROYECTS } from '../constants/proyects.constants';
import { Proyect } from '../interfaces/proyects.interface';

@Component({
  standalone: true,
  selector: 'app-proyects',
  imports: [ProyectComponent],
  templateUrl: './proyects.component.html',
  styleUrl: './proyects.component.scss'
})
export class ProyectsComponent extends AnimateComponent {
  proyects: Proyect[] = PROYECTS.sort((a, b) => b.year - a.year);
}
