import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnregisteredHome } from './unregistered-home';

describe('UnregisteredHome', () => {
  let component: UnregisteredHome;
  let fixture: ComponentFixture<UnregisteredHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnregisteredHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnregisteredHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
