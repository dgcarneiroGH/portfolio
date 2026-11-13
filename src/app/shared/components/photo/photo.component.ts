import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-photo',
  standalone: true,
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhotoComponent {
  imgBase = input.required<string>();
  altText = input.required<string>();
  caption = input<string>();
  accent = input<'neutral' | 'amber' | 'blue'>('neutral');

  src480 = computed(() => `assets/images/photos/${this.imgBase()}-480.avif`);
  src960 = computed(() => `assets/images/photos/${this.imgBase()}-960.avif`);

  srcset = computed(() => `${this.src480()} 480w, ${this.src960()} 960w`);
}
