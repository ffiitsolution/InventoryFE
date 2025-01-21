declare var require: any;

export const environment = {
  production: false,
  name: 'dev',
  VERSION: require('../../package.json').version,
  versionCheckURL: window.location.origin + '/project/version.json'
};
