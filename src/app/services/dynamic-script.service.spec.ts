import { TestBed } from '@angular/core/testing';

import { DynamicScriptService } from './dynamic-script.service';

describe('DynamicScriptService', () => {
  let service: DynamicScriptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicScriptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
