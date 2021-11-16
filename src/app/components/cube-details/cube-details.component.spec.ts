import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CubeDetailsComponent } from './cube-details.component';

describe('CubeDetailsComponent', () => {
  let component: CubeDetailsComponent;
  let fixture: ComponentFixture<CubeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CubeDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CubeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
