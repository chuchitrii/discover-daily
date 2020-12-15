import { TestBed } from '@angular/core/testing';

import { CallbackAuthGuard } from './callback-auth.guard';

describe('CallbackAuthGuard', () => {
  let guard: CallbackAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CallbackAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
