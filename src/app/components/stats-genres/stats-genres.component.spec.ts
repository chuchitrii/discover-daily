import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsGenresComponent } from './stats-genres.component';

describe('StatsGenresComponent', () => {
  let component: StatsGenresComponent;
  let fixture: ComponentFixture<StatsGenresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsGenresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsGenresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
