import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WeatherSummary from "@/models/WeatherSummary";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req) {
  await dbConnect();
  try {
    const { weatherData, city } = await req.json();
    const cityName = city.toLowerCase();

    const cachedData = await WeatherSummary.findOne({ city: cityName });

    if (cachedData && Date.now() - cachedData.createdAt < 1000 * 60 * 60 * 3) {
      console.log(`--- Serving ${city} from Cache ---`);
      return NextResponse.json({ summary: cachedData.summary, cached: true });
    }

    console.log(`--- Calling Gemini for ${city} ---`);

    const prompt = `
      You are an expert local meteorologist. Using the following real-time data for ${city}:
      - Temperature: ${weatherData.main.temp}°C (Feels like: ${weatherData.main.feels_like}°C)
      - Humidity: ${weatherData.main.humidity}%
      - Description: ${weatherData.weather[0].description}
      - Wind: ${weatherData.wind.speed} m/s
      - Visibility: ${weatherData.visibility / 1000} km
      - Cloud Cover: ${weatherData.clouds.all}%
      
      Write a detailed, engaging weather summary in exactly 5-7 lines. 
      Analyze the interaction between humidity and wind (e.g., will it feel muggy or breezy?). 
      Mention if the visibility is good for driving and what kind of clothing is best. 
      End with a helpful 'Tip of the Day' tailored to these specific conditions.
      Do not wish good morning, good afternoon or good evening.
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    await WeatherSummary.findOneAndUpdate(
      { city: cityName },
      { summary, createdAt: new Date(), temp: weatherData.main.temp },
      { upsert: true },
    );

    return NextResponse.json({ summary, cached: false });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "AI failed to generate summary" },
      { status: 500 },
    );
  }
}
