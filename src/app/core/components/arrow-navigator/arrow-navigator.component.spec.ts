import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrowNavigatorComponent } from './arrow-navigator.component';

describe('ArrowNavigatorComponent', () => {
  let component: ArrowNavigatorComponent;
  let fixture: ComponentFixture<ArrowNavigatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrowNavigatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrowNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
