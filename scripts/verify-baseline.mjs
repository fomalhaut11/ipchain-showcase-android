import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = JSON.parse(await readFile(path.join(root, 'release/baseline.json'), 'utf8'));
const config = JSON.parse(await readFile(path.join(root, 'capacitor.config.json'), 'utf8'));
const gradle = await readFile(path.join(root, 'android/app/build.gradle'), 'utf8');
const errors = [];

if (config.appId !== baseline.appId || config.appName !== baseline.appName) {
  errors.push('Capacitor application identity differs from the recorded release.');
}
if (config.server || config.android?.webContentsDebuggingEnabled !== false) {
  errors.push('Expected bundled web content and disabled WebView debugging.');
}
if (!gradle.includes(`applicationId "${baseline.appId}"`) ||
    !gradle.includes(`versionName "${baseline.versionName}"`) ||
    !new RegExp(`versionCode\\s+${baseline.versionCode}\\b`).test(gradle)) {
  errors.push('Android application identity or version differs from the release.');
}

async function listFiles(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) {
      files.push(...await listFiles(path.join(directory, entry.name), relative + '/'));
    } else if (entry.isFile()) {
      files.push(relative);
    }
  }
  return files.sort();
}

const dist = path.join(root, 'web/dist');
const expected = Object.keys(baseline.webAssetSha256).sort();
const actual = await listFiles(dist);
if (JSON.stringify(expected) !== JSON.stringify(actual)) {
  errors.push('The built web asset list differs from the original APK.');
}
for (const relative of expected) {
  try {
    const hash = createHash('sha256').update(await readFile(path.join(dist, relative))).digest('hex');
    if (hash !== baseline.webAssetSha256[relative]) errors.push(`Asset content differs: ${relative}`);
  } catch (error) {
    if (error.code === 'ENOENT') errors.push(`Missing asset: ${relative}`);
    else throw error;
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${expected.length} web assets against the 2026-10-26 APK, plus application ID and version.`);
}
