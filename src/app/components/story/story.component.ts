import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Horrocube } from 'src/app/models/Horrocube';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ApiService }        from '../../api.service';

@Component({
  selector: 'story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css']
})

/***
 * CardDetailsComponent Component
 */
export class StoryComponent implements OnInit {


  constructor(private api: ApiService, private router:Router) { }

  ngOnInit(): void {

  }
}
