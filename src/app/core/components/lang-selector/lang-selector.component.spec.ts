import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangSelectorComponent } from './lang-selector.component';

describe('LangSelectorComponent', () => {
  let component: LangSelectorComponent;
  let fixture: ComponentFixture<LangSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LangSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
