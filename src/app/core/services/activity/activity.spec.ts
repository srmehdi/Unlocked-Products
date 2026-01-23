import { TestBed } from '@angular/core/testing';

import { Activity } from './activity';

describe('Activity', () => {
  let service: Activity;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Activity);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
