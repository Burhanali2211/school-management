import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(); // Ensure user is authenticated
    
    // In a real application, you would integrate with a weather API like OpenWeatherMap
    // For now, we'll provide realistic mock data based on the current season
    const now = new Date();
    const month = now.getMonth();
    
    // Generate realistic weather based on season
    let weatherData;
    
    if (month >= 2 && month <= 4) { // Spring
      weatherData = {
        location: "New York, NY",
        temperature: Math.floor(Math.random() * 15) + 10, // 10-25°C
        condition: "Partly Cloudy",
        humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
        windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
        icon: "partly-cloudy"
      };
    } else if (month >= 5 && month <= 7) { // Summer
      weatherData = {
        location: "New York, NY",
        temperature: Math.floor(Math.random() * 20) + 20, // 20-40°C
        condition: "Sunny",
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
        icon: "sunny"
      };
    } else if (month >= 8 && month <= 10) { // Fall
      weatherData = {
        location: "New York, NY",
        temperature: Math.floor(Math.random() * 20) + 5, // 5-25°C
        condition: "Cloudy",
        humidity: Math.floor(Math.random() * 35) + 45, // 45-80%
        windSpeed: Math.floor(Math.random() * 20) + 10, // 10-30 km/h
        icon: "cloudy"
      };
    } else { // Winter
      weatherData = {
        location: "New York, NY",
        temperature: Math.floor(Math.random() * 20) - 5, // -5 to 15°C
        condition: "Snowy",
        humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
        windSpeed: Math.floor(Math.random() * 25) + 10, // 10-35 km/h
        icon: "snowy"
      };
    }

    // Add some randomness to make it feel more realistic
    const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Snowy"];
    weatherData.condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Update icon based on condition
    if (weatherData.condition === "Sunny") weatherData.icon = "sunny";
    else if (weatherData.condition === "Rainy") weatherData.icon = "rainy";
    else if (weatherData.condition === "Snowy") weatherData.icon = "snowy";
    else weatherData.icon = "cloudy";

    return NextResponse.json({ weather: weatherData });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 