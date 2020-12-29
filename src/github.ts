/* TODO: This should all be moved to index.ts */
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import type { OctokitOptions } from './types';

import * as common from './common';
import * as input from './input';

/**
 * @returns A [[GitHub]] object with better defaults. If not running under
 * GitHub Actions, this function returns an unauthenticated client. This is
 * intended for local testing until a proper 'mock' object can be created for
 * unit tests only when running locally.
 * @param authToken If this is not set, and `options?.auth` is not set, this
 * will attempt to fallback to a `github-token` input or a `$GITHUB_TOKEN`
 * environment variable. When *not* running under GitHub actions, this fallback
 * is ignored and an unauthenticated client might result instead.
 * @param options These are passed through nearly untouched to the underlying
 * [[GitHub]] client.
 * @category GitHub
 */
export function client(authToken?: string, options?: OctokitOptions) {
  if (common.isGitHubActions()) {
    if (!options?.auth) {
      authToken ||= input.getToken();
    }
    if (!authToken && !options?.auth) {
      throw new Error(`'authToken' or 'options.auth' is required`);
    }
    if (authToken && options?.auth) {
      throw new Error(`Cannot set both 'token' or 'options.auth'`);
    }
    return github.getOctokit(authToken ?? '', options);
  } else {
    /* TODO: This will be removed once we know we are reliably stable for the
     * API
     */
    common.warn('Not running under GitHub Actions.');
    common.warn('Unauthenticated instance returned.');
    return new GitHub();
  }
}
