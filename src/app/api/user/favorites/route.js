import dbConnect from "@/lib/mongodb";

import Users from "@/models/Users";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function POST(req) {
  await dbConnect();

  try {
    const { city } = await req.json();
    const token = req.cookies.get("token")?.value;

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.userId) {
      return NextResponse.json(
        { error: "Invalid Token Payload" },
        { status: 400 },
      );
    }

    const userId = String(payload.userId).trim();

    const user = await Users.findById(userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const cityIndex = user.favorites.indexOf(city.toLowerCase().trim());

    if (cityIndex > -1) {
      user.favorites.splice(cityIndex, 1);
    } else {
      user.favorites.push(city.toLowerCase());
    }

    await user.save();
    return NextResponse.json({ favorites: user.favorites });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  await dbConnect();
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (!payload.userId) {
      return NextResponse.json(
        { error: "Invalid Token Payload" },
        { status: 400 },
      );
    }

    const user = await Users.findById(payload.userId);
    if (!user || !user.favorites.length) return NextResponse.json([]);
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherData = await Promise.all(
      user.favorites.map(async (city) => {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`,
        );
        return res.ok ? await res.json() : null;
      }),
    );

    return NextResponse.json(weatherData.filter((d) => d !== null));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
