/**
 * @file app-routing.module.ts
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

import { NgModule }             from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent }       from './components/index/index.component';
import { PageErrorComponent }   from './components/page-error/page-error.component';
import { StoryComponent }       from './components/story/story.component';
import { MasterPageComponent }  from './components/master-page/master-page.component';

/* EXPORTS *******************************************************************/

/**
 * The application routes.
 */
const routes: Routes = [
  {
    path: '',
    component: MasterPageComponent,
    children: [
      { path: '', component: IndexComponent },
      { path: 'index', component: IndexComponent },
      { path: 'story', component: StoryComponent },
      { path: '**', pathMatch: 'full', component: PageErrorComponent }
    ]
  },
];

/**
 * Rounting module declaration.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled',
  scrollOffset: [0, 0],
  anchorScrolling: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
