import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredHome } from './registered-home';

describe('RegisteredHome', () => {
  let component: RegisteredHome;
  let fixture: ComponentFixture<RegisteredHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisteredHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisteredHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
