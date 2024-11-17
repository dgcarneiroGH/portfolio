import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shorten',
  standalone: true
})
export class ShortenPipe implements PipeTransform {
  transform(
    value: string,
    startingPoint: number,
    maxLength: number,
    separator = '...',
    addSeparator = true
  ): string {
    return value.length > maxLength
      ? addSeparator
        ? separator + value.slice(startingPoint, maxLength) + separator
        : value.slice(startingPoint, maxLength)
      : value;
  }
}
