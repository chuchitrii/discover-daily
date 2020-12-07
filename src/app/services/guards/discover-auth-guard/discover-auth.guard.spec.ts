import { TestBed } from '@angular/core/testing';

import { DiscoverGuard } from './discover-auth.guard';

describe('DiscoverGuard', () => {
  let guard: DiscoverGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DiscoverGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
