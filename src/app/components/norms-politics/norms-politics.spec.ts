import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormsPolitics } from './norms-politics';

describe('NormsPolitics', () => {
  let component: NormsPolitics;
  let fixture: ComponentFixture<NormsPolitics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NormsPolitics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormsPolitics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
