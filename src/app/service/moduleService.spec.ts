import { TestBed } from '@angular/core/testing';

import { ModuleService } from './moduleService';

describe('Module', () => {
  let service: ModuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
