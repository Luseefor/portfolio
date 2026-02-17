import { NextResponse } from 'next/server';
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/research/adminAuth';
import { readSourceConfigs, writeSourceConfigs } from '@/lib/research/sourceStore';
import { validatePatchSourceConfig } from '@/lib/research/validation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAdminAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const validation = validatePatchSourceConfig(body);

    if (!validation.value) {
      return NextResponse.json({ message: validation.error ?? 'Invalid patch payload.' }, { status: 400 });
    }

    const sources = await readSourceConfigs();
    const sourceIndex = sources.findIndex((source) => source.id === id);

    if (sourceIndex === -1) {
      return NextResponse.json({ message: 'Source not found.' }, { status: 404 });
    }

    const updated = {
      ...sources[sourceIndex],
      ...validation.value,
    };

    sources[sourceIndex] = updated;
    await writeSourceConfigs(sources);

    return NextResponse.json({ source: updated });
  } catch (error) {
    console.error('Research source patch error:', error);
    return NextResponse.json({ message: 'Failed to patch source.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isAdminAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    const sources = await readSourceConfigs();
    const sourceIndex = sources.findIndex((source) => source.id === id);

    if (sourceIndex === -1) {
      return NextResponse.json({ message: 'Source not found.' }, { status: 404 });
    }

    const [removed] = sources.splice(sourceIndex, 1);
    await writeSourceConfigs(sources);

    return NextResponse.json({ source: removed });
  } catch (error) {
    console.error('Research source delete error:', error);
    return NextResponse.json({ message: 'Failed to delete source.' }, { status: 500 });
  }
}
