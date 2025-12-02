import { Routes } from '@angular/router';
import { UnregisteredHome } from './unregistered-home/unregistered-home';
import { Mission } from './mission/mission';

export const routes: Routes = [
    { path: '', component: UnregisteredHome},
    { path: 'mission', component: Mission}
];
