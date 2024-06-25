// // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export async function middleware(request: NextRequest) {
//     const accessToken = request.cookies.get('accessToken');

//     if (!accessToken) {
//         return NextResponse.redirect(new URL('/login', request.url));
//     }

//     try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/validateToken`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//             },
//         });

//         if (!res.ok) {
//             throw new Error('Token validation failed');
//         }

//         const data = await res.json();
//         if (!data.isValid) {
//             return NextResponse.redirect(new URL('/login', request.url));
//         }
//     } catch (error) {
//         console.error('Token validation error:', error);
//         return NextResponse.redirect(new URL('/login', request.url));
//     }

//     return NextResponse.next();
// }

// // Configure the paths to include in the middleware
// export const config = {
//     matcher: ['/protected-route/:path*', '/another-protected-route/:path*'],
// };
