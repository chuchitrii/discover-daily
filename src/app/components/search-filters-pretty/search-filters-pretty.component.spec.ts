import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFiltersPrettyComponent } from './search-filters-pretty.component';

describe('SearchFiltersPrettyComponent', () => {
  let component: SearchFiltersPrettyComponent;
  let fixture: ComponentFixture<SearchFiltersPrettyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchFiltersPrettyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFiltersPrettyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
