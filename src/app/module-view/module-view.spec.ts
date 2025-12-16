import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleView } from './module-view';

describe('ModuleView', () => {
  let component: ModuleView;
  let fixture: ComponentFixture<ModuleView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
