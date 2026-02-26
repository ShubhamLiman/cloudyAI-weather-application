import dbConnect from "@/lib/mongodb";
import Comments from "@/models/Comments";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function POST(req) {
  await dbConnect();
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json(
        { error: "Please login to comment" },
        { status: 401 },
      );

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const { city, text } = await req.json();
    const userName = payload.name || "Anonymous";

    if (!city || !text)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount > 50) {
      return NextResponse.json(
        { error: "Comment must be under 50 words" },
        { status: 400 },
      );
    }

    const newComment = await Comments.create({
      city: city.toLowerCase(),
      userName,
      text,
    });

    return NextResponse.json(newComment);
  } catch (error) {
    console.error("Mongoose Error:", error.message);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city")?.toLowerCase();

  if (!city)
    return NextResponse.json({ error: "City required" }, { status: 400 });

  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const comments = await Comments.find({
      city,
      createdAt: { $gte: twentyFourHoursAgo },
    }).sort({ createdAt: -1 });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}
