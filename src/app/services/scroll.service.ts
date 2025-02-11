import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private _hasReachedTop = new BehaviorSubject<boolean>(true);
  private _hasReachedBottom = new BehaviorSubject<boolean>(false);

  hasReachedTop$ = this._hasReachedTop.asObservable();
  hasReachedBottom$ = this._hasReachedBottom.asObservable();

  setHasReachedTop(value: boolean): void {
    this._hasReachedTop.next(value);
  }

  setHasReachedBottom(value: boolean): void {
    this._hasReachedBottom.next(value);
  }
}
