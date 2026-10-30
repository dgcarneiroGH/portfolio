import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProcessedPost } from '../../models/processed-post.model';
import { UsefulService } from '../../services/useful.service';

const USEFUL_STORAGE_PREFIX = 'blog.useful.';

@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './blog-article.component.html',
  styleUrl: './blog-article.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // UsefulService no es providedIn: 'root' (revisión Task 2): se declara aquí.
  providers: [UsefulService]
})
export class BlogArticleComponent {
  post = input.required<ProcessedPost>();
  currentLocale = input.required<string>();

  // Artículos adyacentes en el listado (desc por publishedAt). Null en los
  // bordes del listado: la tarjeta correspondiente no se renderiza.
  previous = input<ProcessedPost | null>(null);
  next = input<ProcessedPost | null>(null);

  private usefulService = inject(UsefulService);

  // linkedSignal: valor inicial derivado del post de turno y reinicio
  // automático si el post cambia (navegación anterior/siguiente, Task 4c).
  readonly usefulCount = linkedSignal<number>(() => this.post().usefulCount);

  // "Me resultó útil" persistido por artículo en localStorage.
  readonly marked = linkedSignal<boolean>(
    () => !!localStorage.getItem(USEFUL_STORAGE_PREFIX + this.post().id)
  );

  // Reactiva al post de turno (revisión Task 4b): la instancia del componente
  // se reutiliza al navegar entre artículos (misma ruta, cambia el param), así
  // que leer window.location.href directo divulgaría la url del artículo
  // anterior. La ruta del app usa withHashLocation → origin + /#/blog/{slug}.
  readonly linkedinShareUrl = computed(
    () =>
      'https://www.linkedin.com/sharing/share-offsite/?url=' +
      encodeURIComponent(`${window.location.origin}/#/blog/${this.post().slug}`)
  );

  markUseful(): void {
    // Guard síncrono: evita el doble POST y el doble incremento.
    if (this.marked()) {
      return;
    }

    // Capturar el post de turno EN el click: la instancia del componente se
    // reutiliza al navegar anterior/siguiente (misma ruta, cambia el param),
    // así que una respuesta en vuelo del artículo anterior puede llegar cuando
    // ya se muestra otro artículo — no debe escribir en su badge.
    const postId = this.post().id;
    const storageKey = USEFUL_STORAGE_PREFIX + postId;
    const preClickCount = this.usefulCount();

    localStorage.setItem(storageKey, 'true');
    this.marked.set(true);
    this.usefulCount.set(preClickCount + 1); // optimista

    this.usefulService.markUseful(postId).subscribe({
      // El service emite el count autoritativo del backend.
      next: (count) => {
        // Respuesta tardía de otro artículo: ignorarla.
        if (this.post().id !== postId) {
          return;
        }
        this.usefulCount.set(count);
      },
      error: () => {
        // Un click fallido no persiste la marca, llegue cuando llegue la
        // respuesta (aunque ya se muestre otro artículo).
        localStorage.removeItem(storageKey);
        // Revertir contador y estado local solo si seguimos en el mismo
        // artículo; los del artículo actual son suyos.
        if (this.post().id !== postId) {
          return;
        }
        this.usefulCount.set(preClickCount);
        this.marked.set(false);
      }
    });
  }
}
