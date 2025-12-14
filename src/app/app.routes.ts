import { Routes } from '@angular/router';
import { NewPassword } from './new-password/new-password';
import { LoginRegistro } from './login-registro/login-registro';
import { UnregisteredHome } from './unregistered-home/unregistered-home';
import { Mission } from './mission/mission';
import { TeachingMethod } from './teaching-method/teaching-method';
import { NormsPolitics } from './norms-politics/norms-politics';
import { RegisteredHome } from './registered-home/registered-home';
import { EditProfile } from './edit-profile/edit-profile';

export const routes: Routes = [
    { path: '', component: UnregisteredHome},
    { path: 'mission', component: Mission},
    { path: 'teaching-method', component: TeachingMethod},
    { path: 'norms-politics', component: NormsPolitics},
    {path: 'login-registro', component:LoginRegistro},
    {path: 'new-password', component:NewPassword},
    {path: 'login-registro', redirectTo: 'login-registro', pathMatch: 'full'},
    {path: 'registered-home', component: RegisteredHome},
    {path: 'edit-profile', component: EditProfile},
];