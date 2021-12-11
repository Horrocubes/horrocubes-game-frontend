// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUrl: 'http://192.168.0.94:8080/api/',
  ipfsBaseUrl: 'https://gateway.pinata.cloud/ipfs/',
  cubePolicyId: 'f0b5032869528463f17f2c6c8b180edefb512c86936a2d7c27515611',
  storyPolicyId: '07599433c1f538dea3dfc580bf1a5422bb2753df29bdbcb76d68bffc',
  storyPostfix: 's0Story'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
