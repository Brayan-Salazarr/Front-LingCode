import { Routes } from '@angular/router';
import { UnregisteredHome } from './unregistered-home/unregistered-home';
import { Mission } from './mission/mission';
import { TeachingMethod } from './teaching-method/teaching-method';
import { NormsPolitics } from './norms-politics/norms-politics';

export const routes: Routes = [
    { path: '', component: UnregisteredHome},
    { path: 'mission', component: Mission},
    { path: 'teaching-method', component: TeachingMethod},
    { path: 'norms-politics', component: NormsPolitics}
];
