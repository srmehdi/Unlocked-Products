import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusModal } from './status-modal';

describe('StatusModal', () => {
  let component: StatusModal;
  let fixture: ComponentFixture<StatusModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
