import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ColorThiefService } from '@soarlin/angular-color-thief';
import { of } from 'rxjs';
import { ProjectComponent } from './project.component';

const mockLoader = { getTranslation: () => of({}) };

const colorThiefSpy = jasmine.createSpyObj<ColorThiefService>(
  'ColorThiefService', ['getColor', 'getPalette']
);

describe('ProjectComponent', () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProjectComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })
      ],
      providers: [
        { provide: ColorThiefService, useValue: colorThiefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('coverImgSrc', '/assets/img/project.jpg');
    fixture.componentRef.setInput('name', 'Portfolio');
    fixture.componentRef.setInput('description', 'My portfolio project');
    fixture.componentRef.setInput('altKey', 'PROJECTS.PORTFOLIO_ALT');
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('expandedIndex', null);

    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
