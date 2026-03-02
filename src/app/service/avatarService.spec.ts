import { TestBed } from '@angular/core/testing';

import { avatarService } from './avatarService';

describe('Avatar', () => {
  let service: avatarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(avatarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
