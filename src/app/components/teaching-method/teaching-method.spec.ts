import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachingMethod } from './teaching-method';

describe('TeachingMethod', () => {
  let component: TeachingMethod;
  let fixture: ComponentFixture<TeachingMethod>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeachingMethod]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeachingMethod);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
