import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselModules } from './carousel-modules';

describe('CarouselModules', () => {
  let component: CarouselModules;
  let fixture: ComponentFixture<CarouselModules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselModules]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarouselModules);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
