import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselAvatar } from './carousel-avatar';

describe('CarouselAvatar', () => {
  let component: CarouselAvatar;
  let fixture: ComponentFixture<CarouselAvatar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselAvatar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarouselAvatar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
