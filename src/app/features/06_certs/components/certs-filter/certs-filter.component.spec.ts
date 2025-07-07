import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertsFilterComponent } from './certs-filter.component';

describe('CertsFilterComponent', () => {
  let component: CertsFilterComponent;
  let fixture: ComponentFixture<CertsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertsFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CertsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
