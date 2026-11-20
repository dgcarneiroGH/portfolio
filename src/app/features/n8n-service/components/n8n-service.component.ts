import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Página "N8N" del portfolio (ruta /n8n), destino del navbar y del CTA de la
 * tarjeta de services. Placeholder vacío: el contenido llega en tareas de
 * diseño. La raíz <section> hereda los estilos globales de styles.scss
 * (flex + padding que compensa el header fijo) y mantiene el fondo por
 * defecto de la app (regla AGENTS 2026-11-17).
 */
@Component({
  selector: 'app-n8n-service',
  standalone: true,
  templateUrl: './n8n-service.component.html',
  styleUrl: './n8n-service.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class N8nServiceComponent {}
