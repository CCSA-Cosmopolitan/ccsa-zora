import { NextRequest,NextResponse } from 'next/server';
// Retired prototype dashboards must not display fabricated quotas, invoices or API keys.
export function proxy(request:NextRequest){const path=request.nextUrl.pathname;if(path.startsWith('/dashboard/')&&path!=='/dashboard/history')return NextResponse.redirect(new URL('/dashboard',request.url));return NextResponse.next();}
export const config={matcher:['/dashboard/:path*']};
