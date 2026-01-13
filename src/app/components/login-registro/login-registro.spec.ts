import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginRegistro } from './login-registro';

describe('LoginRegistro', () => {
  let component: LoginRegistro;
  let fixture: ComponentFixture<LoginRegistro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginRegistro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginRegistro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
