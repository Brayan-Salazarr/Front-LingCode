import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes,
      withInMemoryScrolling({
        /*Se agrega enable para iniciar arriba al momento de cambiar de vista,
        y cuando regrese que lo deje donde habia quedado en la vista anterior*/
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient()
  ]
};
