/**
 * @file StoryComponent.ts
 *
 * @author Angel Castillo <angel.castillo@horrocubes.io>
 * @date   Dec 10 2021
 *
 * @copyright Copyright 2021 Horrocubes.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* IMPORTS *******************************************************************/

import { Component, OnInit }    from '@angular/core';
import { Router }               from '@angular/router';
import { Horrocube }            from 'src/app/models/Horrocube';
import { DomSanitizer }         from '@angular/platform-browser';
import { AplaStoryContent }     from 'src/app/models/content/AplaStoryContent';
import { Level }                from 'src/app/models/Level';
import { Sha256 }               from '../../vendors/sha256';
import { NgbModal }             from '@ng-bootstrap/ng-bootstrap';
import { ViewChild }            from '@angular/core';
import { Story }                from 'src/app/models/Story';
import { DAppConnectorService } from '../../DAppConnector.service';

// EXPORTS ************************************************************************************************************/

@Component({
  selector: 'story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css']
})

/***
 * StoryComponent Component.
 */
export class StoryComponent implements OnInit {

  _levels: Level[] = [];
  _currentLevel: Level = new Level();
  _currentCube: Horrocube;
  _interval;
  _story: Story = null;
  _content:AplaStoryContent = new AplaStoryContent();
  _invalidAnswer: boolean = false;

  private routeReuseStrategy:any;

  @ViewChild('ModalContentCorrect', { static: false })
  private _rightContent;

  @ViewChild('WaitingForConfirmation', { static: false })
  private _waitForConfirmation;
  
  /**
   * @summary Initializes a new instance of the StoryComponent class.
   * 
   * @param _cardano The Cardano dApp connector.
   * @param router The router.
   * @param modalService The modal service.
   */
  constructor(private _cardano: DAppConnectorService, private router: Router, private modalService: NgbModal, private sanitizer: DomSanitizer)
  {
    this.routeReuseStrategy = this.router.routeReuseStrategy.shouldReuseRoute;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  /**
   * @summary Initialize the component after Angular initializes the data-bound input properties.
   */
  ngOnInit(): void
  {
    this._currentCube = this._cardano.getCurrentCube();

    if (this._currentCube == null) {
    this.router.navigate(['/']);
    }

    this._story = this._currentCube.stories[0];

    for (let i = 0; i < this._story.levels.length; ++i)
    {
      if (i === this._story.currentLevel)
      {
        this._story.levels[i].isCurrent = true;
        this._story.levels[i].isSolved = false;
        for (let j = 0; j < i; ++j)
        {
          this._story.levels[j].isCurrent = false;
          this._story.levels[j].isSolved = true;
        }
      }
      else
      {
        this._story.levels[i].isCurrent = false;
        this._story.levels[i].isSolved = false;
      }
    }
    console.log(this._story);
  }

  /**
   * @summary Event handler for when the component is destroyed.
   */
  public ngOnDestroy():void
  {
    this.router.routeReuseStrategy.shouldReuseRoute = this.routeReuseStrategy;
  }

  /**
   * Parses the asset name.
   * @param name The asset name.
   * 
   * @returns The asset name.
   */
  parseAssetName(name: String)
  {
    return name.substr(9, 5);
  }

  /**
   *  Tracks the semgent width.
   * @returns The segment width.
   */
  getLevelTrackerSegmentWidth()
  {
    return (100.0 / (this._story.levels.length)) + '%';
  }

  /**
   * Gets the current content of the level.
   * 
   * @returns The content.
   */
  getCurrentContent()
  {
    return this.sanitizer.bypassSecurityTrustHtml(this._content.getLevelContent(this._story.currentLevel));
  }

  /**
   * Gets the current content of the level.
   * 
   * @returns The content.
   */
  getCurrentLevelTitle()
  {
    return this._content.getLevelName(this._story.currentLevel);
  }

  /**
   * Gets the current content of the level.
   * 
   * @returns The content.
   */
  getCurrentLevelRewards()
  {
    return this._content.getLevelRewards(this._story.currentLevel);
  }

  /**
   * Gets the current hint of the level.
   * 
   * @returns The content.
   */
   getCurrentHint()
   {
     return this._content.getLevelHint(this._story.currentLevel);
   }
  
  /**
   * Opens the modal.
   * @param content The content of the modal.
   */
  openModal(content)
  {
    this.modalService.open(content, { size: 'lg', windowClass: 'modal-holder', centered: true, backdrop: 'static', animation: true });
  }

  /**
   * Reloads this component.
   */
  reloadComponent()
  {
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }

  /**
   * Closes the modal.
   */
  closeModal()
  {
    this.modalService.dismissAll();
  }

  /**
   * Event handler for when an answer is tried.
   * 
   * @param value The answer value.
   */
  async onClick(value)
  {
    const firstPass = Sha256.hash(this._currentCube.policyId + '.' + this._currentCube.assetName + value);
    const secondPass = Sha256.hash(firstPass, {messageFormat: 'hex-bytes'});

    console.log(this._currentCube.policyId + '.' + this._currentCube.assetName + value);
    console.log(firstPass);
    console.log(secondPass);

    if (secondPass === this._currentCube.stories[0].levels[this._currentCube.stories[0].currentLevel].answerHash)
    {
      const currDatumValue = this._currentCube.stories[0].currentLevel;
      const nexDatValue    = currDatumValue + 1;

      this.openModal(this._rightContent);

      const tx = await this._cardano.buildTransaction(this._currentCube, currDatumValue, nexDatValue, firstPass);
      let txId = await this._cardano.sendTransaction(this._cardano, tx);

      this.closeModal();
      this.openModal(this._waitForConfirmation);
      this.startTimer(txId);
    }
    else
    {
      this._invalidAnswer = true;
      setTimeout(()=>{ 
        this._invalidAnswer = false;
      }, 500);
    }
  }

  /**
   * Starts a timer that tracks the status of a transaction.
   * 
   * @param txId The transaction id.
   */
  startTimer(txId)
  {
    console.log(txId);
    this._interval = setInterval(() => {
      this._cardano.trackTransaction(txId).subscribe((isConfirmed) =>
      {
        console.log(txId);
        console.log(isConfirmed);
        if (isConfirmed)
        {
          clearInterval(this._interval);
          this._cardano.setCurrentCube(this._currentCube);

          if (this._currentCube.stories[0].currentLevel === 3)
          {
            this.router.navigate(['/']);
          }
          else
          {
            this._story.currentLevel = this._story.currentLevel + 1;
            this._currentCube.stories[0] = this._story;
            this.reloadComponent();
          }

          this.closeModal();
        }
      });
    }, 5000);
  }
}
