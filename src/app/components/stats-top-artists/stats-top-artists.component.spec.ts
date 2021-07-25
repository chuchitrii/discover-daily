import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsTopArtistsComponent } from './stats-top-artists.component';

describe('StatsTopArtistsComponent', () => {
  let component: StatsTopArtistsComponent;
  let fixture: ComponentFixture<StatsTopArtistsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsTopArtistsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsTopArtistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
