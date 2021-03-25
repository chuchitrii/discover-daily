import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss'],
})
export class SearchFiltersComponent implements OnInit {
  filters: any = {};
  form: FormGroup;
  inputs: { name: string; min?: number; max?: number; step?: number }[] = [
    {
      name: 'acousticness',
    },
    {
      name: 'danceability',
    },
    {
      name: 'energy',
    },
    {
      name: 'instrumentalness',
    },
    {
      name: 'liveness',
      // not sure
    },
    {
      name: 'popularity',
      min: 0,
      max: 100,
      step: 1,
    },
    {
      name: 'tempo',
      min: 0,
      max: 300,
      step: 1,
    },
    {
      name: 'valence',
    },
  ];

  constructor() {}

  ngOnInit() {
    this.form = new FormGroup({});
    this.inputs.forEach((input) => {
      this.form.addControl('min_' + input.name, new FormControl());
      this.form.addControl('target_' + input.name, new FormControl());
      this.form.addControl('max_' + input.name, new FormControl());
      this.filters['min_' + input.name] = null;
      this.filters['target_' + input.name] = null;
      this.filters['max_' + input.name] = null;
    });
    this.form.reset(this.filters);
    this.form.valueChanges.subscribe((ch) => {
      console.log(ch);
    });
  }
}
