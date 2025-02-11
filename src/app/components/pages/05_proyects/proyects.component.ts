import { Component } from '@angular/core';
import { ProyectComponent } from '../../shared/proyect/proyect.component';
import { IProyect } from 'src/app/interfaces';
import { PROYECTS } from 'src/app/constants';
import { AnimateComponent } from '../../animate/animate.component';

@Component({
  standalone: true,
  selector: 'app-proyects',
  imports: [ProyectComponent],
  templateUrl: './proyects.component.html',
  styleUrl: './proyects.component.scss'
})
export class ProyectsComponent extends AnimateComponent {
  proyects: IProyect[] = PROYECTS.sort((a, b) => b.year - a.year);
}
