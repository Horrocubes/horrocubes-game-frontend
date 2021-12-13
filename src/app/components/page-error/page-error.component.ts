/**
 * @file PageErrorComponent.ts
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

import { Component, OnInit } from '@angular/core';

// EXPORTS ************************************************************************************************************/

@Component({
  selector: 'app-page-error',
  templateUrl: './page-error.component.html',
  styleUrls: ['./page-error.component.css']
})

/**
 * Page Error Component
 */
export class PageErrorComponent implements OnInit
{
  /**
   * @summary Initializes a new instance of the PageErrorComponent class.
   */
  constructor()
  {
  }

  /**
   * @summary Initialize the component after Angular initializes the data-bound input properties.
   */
  ngOnInit(): void
  {
  }
}
