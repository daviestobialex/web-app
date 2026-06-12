/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { gitDescribeSync } = require('git-describe');
const { resolve, relative } = require('path');
const { writeFileSync } = require('node:fs');
const moment = require('moment');

function getGitInfo() {
  try {
    return gitDescribeSync({
      dirtyMark: false,
      dirtySemver: false
    });
  } catch (error) {
    const fallbackHash =
      process.env.GITHUB_SHA?.slice(0, 10) ||
      process.env.CI_COMMIT_SHA?.slice(0, 10) ||
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 10) ||
      'unknown';

    console.warn(`git-describe unavailable, falling back to hash "${fallbackHash}": ${error.message}`);

    return {
      hash: fallbackHash,
      raw: fallbackHash
    };
  }
}

const gitInfo = getGitInfo();

gitInfo.version = moment().format('YYMMDD');

const file = resolve(__dirname, '.', 'src', 'environments', '.env.ts');
writeFileSync(
  file,
  `/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
/* tslint:disable */
export default {
  'mifos_x': {
    'version': '${gitInfo.version}',
    'hash': '${gitInfo.hash}'
  },
  'allow_switching_backend_instance': true
};
/* tslint:enable */
`,
  { encoding: 'utf-8' }
);

console.log(`Wrote version info ${gitInfo.raw} to ${relative(resolve(__dirname, '..'), file)}`);
