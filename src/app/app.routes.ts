import { Routes } from '@angular/router';
import { NewPassword } from './components/new-password/new-password';
import { LoginRegistro } from './components/login-registro/login-registro';
import { UnregisteredHome } from './components/unregistered-home/unregistered-home';
import { Mission } from './components/mission/mission';
import { TeachingMethod } from './components/teaching-method/teaching-method';
import { NormsPolitics } from './components/norms-politics/norms-politics';
import { RegisteredHome } from './components/registered-home/registered-home';
import { EditProfile } from './components/edit-profile/edit-profile';
import { AboutUs } from './components/about-us/about-us';
import { HelpSupport } from './components/help-support/help-support';
import { PaymentMethods } from './components/payment-methods/payment-methods';
import { ModuleView } from './components/module-view/module-view';
import { Lesson } from './components/lesson/lesson';
import { OAuth2Callback } from './components/oauth2-callback/oauth2-callback';
import { VerifyEmail } from './components/verify-email/verify-email';
import { PaymentResult } from './components/payment-result/payment-result';

export const routes: Routes = [
    { path: '', component: UnregisteredHome },
    { path: 'mission', component: Mission },
    { path: 'teaching-method', component: TeachingMethod },
    { path: 'norms-politics', component: NormsPolitics },
    { path: 'login-registro', component: LoginRegistro },
    { path: 'new-password', component: NewPassword },
    { path: 'reset-password', component: NewPassword },
    { path: 'login-registro', redirectTo: 'login-registro', pathMatch: 'full'},
    { path: 'registered-home', component: RegisteredHome },
    { path: 'edit-profile', component: EditProfile },
    { path: 'about-us', component: AboutUs },
    { path: 'help-support', component: HelpSupport },
    { path: 'payment-methods', component: PaymentMethods },
    { path: 'module-view', component: ModuleView },
    { path: 'modules/:moduleId/lessons', component: Lesson },
    { path: 'oauth2/callback', component: OAuth2Callback },
    { path: 'verify-email', component: VerifyEmail },
    { path: 'payment-result', component: PaymentResult },
];