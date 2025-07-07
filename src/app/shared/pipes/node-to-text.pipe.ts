import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nodeToText',
  standalone: true
})
export class NodeToTextPipe implements PipeTransform {
  transform(node: any): string {
    let tag = document.createElement('div');
    tag.innerHTML = node;
    node = tag.innerText;
    return node;
  }
}
