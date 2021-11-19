import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Horrocube } from 'src/app/models/Horrocube';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ApiService }        from '../../api.service';
import { Level } from 'src/app/models/Level';
import { StoryService } from '../../story.service';
@Component({
  selector: 'story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css']
})

/***
 * CardDetailsComponent Component
 */
export class StoryComponent implements OnInit {

  _levels:Level[] = [];
  _currentLevel:Level = new Level();
  _currentCube: Horrocube;
  constructor(private api: ApiService, private router:Router, private story: StoryService) { }

  ngOnInit(): void
  {
    this.story.getCurrentLevel().subscribe((x) => this._currentLevel = x);
    this.story.getAllLevels().subscribe((x) => this._levels = x);
    this._currentCube = this.story.getcurrentCube();

    if (this._currentCube == null)
    this.router.navigate(['/']);
    console.log(this._currentCube);
  }

  parseAssetName(name: String)
  {
    return name.substr(9, 5);
  }


  getLevelTrackerSegmentWidth()
  {
    return (100.0 / (this._levels.length)) + "%";
  }

  getCurrentContent()
  {
    return this._levels.find((x) => x.isCurrent);
  }
}
