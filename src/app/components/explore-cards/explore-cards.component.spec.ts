import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreCardsComponent } from './explore-cards.component';

describe('ExploreComponent', () => {
  let component: ExploreCardsComponent;
  let fixture: ComponentFixture<ExploreCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploreCardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
