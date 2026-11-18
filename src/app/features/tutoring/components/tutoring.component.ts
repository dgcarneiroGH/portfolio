import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Página "Tutorías" del portfolio (ruta /tutoring), destino del navbar y del
 * CTA de la tarjeta de services. Placeholder vacío: el contenido llega en
 * tareas de diseño. La raíz <section> hereda los estilos globales de
 * styles.scss (flex + padding que compensa el header fijo) y mantiene el
 * fondo por defecto de la app (regla AGENTS 2026-11-17).
 */
@Component({
  selector: 'app-tutoring',
  standalone: true,
  templateUrl: './tutoring.component.html',
  styleUrl: './tutoring.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutoringComponent {}
