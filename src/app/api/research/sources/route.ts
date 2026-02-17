import { NextResponse } from 'next/server';
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/research/adminAuth';
import { readSourceConfigs, writeSourceConfigs } from '@/lib/research/sourceStore';
import { validateCreateSourceConfig } from '@/lib/research/validation';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const sources = await readSourceConfigs();
    const sorted = [...sources].sort((a, b) => a.priority - b.priority);
    return NextResponse.json({ sources: sorted });
  } catch (error) {
    console.error('Research source list error:', error);
    return NextResponse.json({ message: 'Failed to load source list.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = validateCreateSourceConfig(body);

    if (!validation.value) {
      return NextResponse.json({ message: validation.error ?? 'Invalid source payload.' }, { status: 400 });
    }

    const sources = await readSourceConfigs();
    if (sources.some((source) => source.id === validation.value?.id)) {
      return NextResponse.json({ message: 'A source with this id already exists.' }, { status: 409 });
    }

    sources.push(validation.value);
    await writeSourceConfigs(sources);

    return NextResponse.json({ source: validation.value }, { status: 201 });
  } catch (error) {
    console.error('Research source create error:', error);
    return NextResponse.json({ message: 'Failed to create source.' }, { status: 500 });
  }
}
