import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // 1. Clear the cookie by setting its expiration to the past
    response.cookies.set('token', '', {
      httpOnly: true,
      expires: new Date(0), // Sets date to Jan 1, 1970
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Logout failed" },
      { status: 500 }
    );
  }
}