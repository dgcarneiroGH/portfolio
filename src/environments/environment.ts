// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  sanity: {
    projectId: 'a5eryyb2',
    dataset: 'production',
    apiVersion: '2025-05-11', // o new Date().toISOString().slice(0,10)
    useCdn: true, // true en lectura para caché, false si quieres datos frescos
    token: undefined // NO pongan token en cliente en producción si es write!
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
