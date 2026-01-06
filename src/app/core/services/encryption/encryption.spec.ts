import { TestBed } from '@angular/core/testing';

import { Encryption } from './encryption';

describe('Encryption', () => {
  let service: Encryption;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Encryption);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
