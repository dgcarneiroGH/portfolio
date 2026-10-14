import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TechPillComponent } from './tech-pill.component';

@Component({
  template: `
    <ul>
      <li app-tech-pill [label]="label"></li>
    </ul>
  `,
  imports: [TechPillComponent]
})
class TestHostComponent {
  label = 'Angular';
}

describe('TechPillComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should create', () => {
    fixture.detectChanges();
    const pill = fixture.debugElement.query(By.css('li[app-tech-pill]'));
    expect(pill).toBeTruthy();
  });

  it('should render the label inside the host li', () => {
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('li[app-tech-pill]');
    expect(host).toBeTruthy();
    expect(host.textContent?.trim()).toBe('Angular');
  });
});
