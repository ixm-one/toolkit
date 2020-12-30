export { warn, debug, error, acquire } from './common';
export { getToken, getToolVersion } from './input';
export { client, releases } from './github';
export { validRange } from 'semver';

//export async function asset(
//  owner: string,
//  repo: string,
//  asset: AssetOptions,
//  options?: DeprecatedReleaseOptions
//) {
//  const searchables = await github.releases(owner, repo, options);
//  const selector = common.seeker<Asset>(
//    (() => {
//      switch (process.platform) {
//        case 'darwin':
//          return asset.macos;
//        case 'win32':
//          return asset.windows;
//        default:
//          return asset.linux;
//      }
//    })()
//  );
//  common.debug(`Filtering assets for ${process.platform}`);
//}
