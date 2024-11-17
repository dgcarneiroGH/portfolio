import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediumBlogComponent } from './medium-blog.component';

describe('MediumBlogComponent', () => {
  let component: MediumBlogComponent;
  let fixture: ComponentFixture<MediumBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MediumBlogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediumBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
