import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss'],
})
export class SearchFiltersComponent implements OnInit {
  form: FormGroup;

  constructor() {}

  ngOnInit() {}
}
