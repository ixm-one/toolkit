import * as tc from '@actions/tool-cache';
import * as path from 'path';

type Compression = 'gzip' | 'zip' | '7zip';

function select(type: Compression) {
  switch (type) {
    case 'gzip':
      return tc.extractTar;
    case 'zip':
      return tc.extractZip;
    case '7zip':
      return tc.extract7z;
  }
}

function detect(filename: string): Compression {
  const extension = path.extname(filename);
  if (['.gz', '.tgz', '.bz2'].includes(extension)) {
    return 'gzip';
  } else if (extension === '.zip') {
    return 'zip';
  } else if (extension === '.7z') {
    return '7zip';
  } else {
    throw new Error('Could not detect filetype.');
  }
}

export default async function extract(
  archive: string,
  destination: string,
  type: Compression = detect(archive)
) {
  const extractor = select(type);
  return await extractor(archive, destination);
}
