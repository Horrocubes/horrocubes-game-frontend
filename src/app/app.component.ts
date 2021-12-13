/**
 * @file app.component.ts
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

/* IMPROTS *******************************************************************/

import { Component }             from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

/* EXPORTS *******************************************************************/

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

/**
 * Application main component.
 */
export class AppComponent
{
  title = 'horrocubes-angular';

    /**
   * @summary Initializes a new instance of the AppComponent class.
   * 
   * @param router The router.
   */
  constructor(private router: Router)
  {

    /**
     * Unicons icon refreshed on route change.
     */
    this.router.events.forEach((event) =>
    {
      if (event instanceof NavigationEnd)
      {
        window['Unicons']['refresh']();
      }

      if (!(event instanceof NavigationEnd))
      {
        return;
      }

      window.scrollTo(0, 0);
    });
  }
}
