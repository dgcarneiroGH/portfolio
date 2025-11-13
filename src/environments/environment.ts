export const environment = {
  production: false,
  sanity: {
    projectId: 'a5eryyb2',
    dataset: 'development',
    apiVersion: '2025-05-11', // or new Date().toISOString().slice(0,10)
    useCdn: true, // true for cached reads, false if you want fresh data
    token: undefined // Do NOT put a write token in the client in production!
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
