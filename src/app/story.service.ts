/* IMPORTS *******************************************************************/

import { Injectable }                                 from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError }                     from 'rxjs';
import { catchError, concatMap, mergeMap, map }       from 'rxjs/internal/operators';
import { environment }                                from '../environments/environment';
import { Session }                                    from './models/Session';
import { Horrocube }                                  from './models/Horrocube';
import { Horrocard }                                  from './models/Horrocard';
import { CardanoRef }                                 from './models/CardanoRef';
import * as internal from 'events';
import * as EmurgoSerialization from './vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import { Value } from                './vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import { Subject, defer } from 'rxjs';
import { switchMap, filter, tap } from 'rxjs/operators';
import { Buffer } from 'buffer';
import { Level } from 'src/app/models/Level';
import { LevelFile } from './models/LevelFile';

// EXPORTS ************************************************************************************************************/

@Injectable({
  providedIn: 'root'
})
export class StoryService
{
  public _levels: Level[] = [];
  public level: Level;
  public _currentLevel$: BehaviorSubject<Level> = new BehaviorSubject<Level>(new Level('8', 'sadasdasd', [new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere')], 'asdsadasdasdas', false, false, true));
  public _levels$: BehaviorSubject<Level[]> = new BehaviorSubject<Level[]>([]);
  _currentCube: Horrocube;

  constructor(private _cardanoRef: CardanoRef, private _http: HttpClient)
  {
    this._levels.push(new Level('1', 'sadasdasd', [new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere')], 'asdsadasdasdas', true, false, false));
    this._levels.push(new Level('2', 'sadasdasd', [new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere')], 'asdsadasdasdas', true, false, false));
    this._levels.push(new Level('3', 'sadasdasd', [new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere')], 'asdsadasdasdas', true, false, false));
    this._levels.push(new Level('4', 'sadasdasd', [new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere')], 'asdsadasdasdas', true, false, false));
    this._levels.push(new Level('5', 'sadasdasd', [new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere')], 'asdsadasdasdas', true, false, false));
    this._levels.push(new Level('6', 'sadasdasd', [new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere')], 'asdsadasdasdas', true, false, false));
    this._levels.push(new Level('7', 'sadasdasd', [new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere')], 'asdsadasdasdas', true, false, false));
    this._levels.push(new Level('8', 'sadasdasd', [new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere')], 'asdsadasdasdas', false, false, true));
    this._levels.push(new Level('9', 'sadasdasd', [new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere')], 'asdsadasdasdas', false, true, false));
    this._levels.push(new Level('10', 'sadasdasd', [new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere'), new LevelFile('test.png', 'img/png', 'somewhere')], 'asdsadasdasdas', false, true, false));

    this._levels$.next(this._levels);
  }

  setCurrentCube(cube: Horrocube)
  {
    this._currentCube = cube;
  }

  getcurrentCube()
  {
    return this._currentCube;
  }

  getCurrentLevel()
  {
    return this._currentLevel$;
  }

  getAllLevels()
  {
    return this._levels$;
  }
}
