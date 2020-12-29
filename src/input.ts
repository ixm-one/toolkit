import * as core from '@actions/core';
import { validRange } from 'semver';

/** @internal */
type VersionValidator = (version: string) => boolean;

/**
 * @returns The value of the (optional) input requested by the user, the
 * string representing the input `github-token` or the value of the
 * `$GITHUB_TOKEN` environment variable.
 * @param input An optional action input to lookup instead of `github-token`
 * @category GitHub
 */
export function getToken(input?: string) {
  const token = core.getInput(input || 'github-token');
  return token || core.getInput('github-token') || process.env.GITHUB_TOKEN;
}

/**
 * Retrieve an action input for a given tool, such as `hugo-version`, and
 * validate that it is a valid input. By default (and due to its widespread
 * usage), the semver package is used to validate inputs via `validRange`
 * @returns The value for the action input *or* `undefined` if the input could
 * not be validated.
 * @param tool The expected name of the tool to get (e.g., `hugo-version`)
 * @param validator An optional validator to use against the input. By default,
 * this will use the semver `valid` function
 */
export function getToolVersion(tool: string, validator?: VersionValidator) {
  validator ??= (version: string): boolean => {
    return !!validRange(version);
  };
  const input = core.getInput(`${tool}-version`);
  if (validator(input)) {
    return input;
  }
  return undefined;
}
