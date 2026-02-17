import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ResearchSourceConfig } from '@/lib/research/types';

const SOURCE_FILE_PATH = path.join(process.cwd(), 'src/data/research-sources.json');

async function ensureSourceConfigFileExists() {
  try {
    await fs.access(SOURCE_FILE_PATH);
  } catch {
    await fs.mkdir(path.dirname(SOURCE_FILE_PATH), { recursive: true });
    await fs.writeFile(SOURCE_FILE_PATH, '[]\n', 'utf8');
  }
}

function parseSourceConfigArray(contents: string): ResearchSourceConfig[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return [];
  }

  return Array.isArray(parsed) ? (parsed as ResearchSourceConfig[]) : [];
}

export async function readSourceConfigs(): Promise<ResearchSourceConfig[]> {
  await ensureSourceConfigFileExists();
  const contents = await fs.readFile(SOURCE_FILE_PATH, 'utf8');
  return parseSourceConfigArray(contents);
}

export async function writeSourceConfigs(configs: ResearchSourceConfig[]) {
  await ensureSourceConfigFileExists();
  await fs.writeFile(SOURCE_FILE_PATH, `${JSON.stringify(configs, null, 2)}\n`, 'utf8');
}

export function getSourceFilePath() {
  return SOURCE_FILE_PATH;
}
