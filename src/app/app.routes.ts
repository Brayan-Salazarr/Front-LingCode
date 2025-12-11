import { Routes } from '@angular/router';
import { NewPassword } from './new-password/new-password';
import { LoginRegistro } from './login-registro/login-registro';

export const routes: Routes = [
    {path: 'login-registro', component:LoginRegistro},
    {path: 'new-password', component:NewPassword},
    {path: '', redirectTo: 'login-registro', pathMatch: 'full'}
];