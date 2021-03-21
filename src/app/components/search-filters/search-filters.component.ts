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
      this.form.addControl(input.name, new FormControl());
      this.filters[input.name] = null;
    });
    console.log(this.form);
    this.form.reset(this.filters);
    this.form.valueChanges.subscribe((ch) => {
      console.log(ch);
    });
  }
}
