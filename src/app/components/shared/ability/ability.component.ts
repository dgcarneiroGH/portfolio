import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ability',
  standalone: true,
  imports: [],
  templateUrl: './ability.component.html',
  styleUrl: './ability.component.scss'
})
export class AbilityComponent {
  @Input() progress: number = 80; // Porcentaje de progreso (0 a 100)
  @Input() text: string = 'HTML'; // Texto debajo del semicírculo

  // Calcula el valor para el trazo del SVG basado en el porcentaje
  get strokeDasharray(): string {
    const radius = 50; // Radio del semicírculo
    const circumference = Math.PI * radius; // Longitud del arco
    const progressLength = (this.progress / 100) * circumference;
    return `${progressLength} ${circumference - progressLength}`;
  }
}
