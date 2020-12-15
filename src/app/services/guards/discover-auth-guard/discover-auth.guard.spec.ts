import { TestBed } from '@angular/core/testing';

import { DiscoverAuthGuard } from './discover-auth.guard';

describe('DiscoverAuthGuard', () => {
  let guard: DiscoverAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DiscoverAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
