import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllAppInfoComponent } from './index/index.component';
import { ModulesComponent } from './modules/modules.component';
import { ReleaseNoteComponent } from './release-note/release-note.component';
import { AboutSoftwareComponent } from './about-software/about-software.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all',
        component: AllAppInfoComponent,
      },
      {
        path: 'modules',
        component: ModulesComponent,
      },
      {
        path: 'release-notes',
        component: ReleaseNoteComponent,
      },
      {
        path: 'about-software',
        component: AboutSoftwareComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppInfoRoutingModule {}
