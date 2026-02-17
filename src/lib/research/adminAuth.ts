import { NextResponse } from 'next/server';

export function isAdminAuthorized(request: Request): boolean {
  const expectedToken = process.env.RESEARCH_ADMIN_TOKEN;
  if (!expectedToken) {
    return false;
  }

  const provided = request.headers.get('x-admin-token')?.trim();
  return Boolean(provided && provided === expectedToken);
}

export function unauthorizedResponse() {
  return NextResponse.json(
    {
      message: 'Unauthorized. Provide a valid admin token via x-admin-token.',
    },
    { status: 401 },
  );
}
