import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from "@angular/router";
import { ActivatedRoute } from '@angular/router'
@Component({
  selector: 'session-expired.',
  templateUrl: './session-expired.component.html',
  styleUrls: ['./session-expired.component.css']
})

/***
 * SessionExpiredComponent Component
 */
export class SessionExpiredComponent implements OnInit {

  id: string

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')
  }

}
