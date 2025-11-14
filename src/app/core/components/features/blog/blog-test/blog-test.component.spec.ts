import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogTestComponent } from './blog-test.component';

describe('BlogTestComponent', () => {
  let component: BlogTestComponent;
  let fixture: ComponentFixture<BlogTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
