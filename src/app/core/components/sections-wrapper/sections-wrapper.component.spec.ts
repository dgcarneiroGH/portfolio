import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionsWrapperComponent } from './sections-wrapper.component';

describe('SectionsWrapperComponent', () => {
  let component: SectionsWrapperComponent;
  let fixture: ComponentFixture<SectionsWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionsWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionsWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
