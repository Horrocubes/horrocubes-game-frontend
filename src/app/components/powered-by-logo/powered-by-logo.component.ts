import { Component, OnInit } from '@angular/core';

interface client {
  image: string;
}

@Component({
  selector: 'powered-by-logo',
  templateUrl: './powered-by-logo.component.html',
  styleUrls: ['./powered-by-logo.component.css']
})
export class PoweredByComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
