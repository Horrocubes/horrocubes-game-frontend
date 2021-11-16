import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoweredByComponent } from './powered-by-logo.component';

describe('PoweredByComponent', () => {
  let component: PoweredByComponent;
  let fixture: ComponentFixture<PoweredByComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoweredByComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoweredByComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
