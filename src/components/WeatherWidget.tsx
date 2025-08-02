"use client";

import { SunIcon, CloudIcon, MapPinIcon, ThermometerIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const WeatherWidget = () => {
  // Mock weather data - in real app, this would come from weather API
  const weatherData = {
    location: "New York, NY",
    temperature: 22,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    icon: "partly-cloudy"
  };

  const WeatherIcon = weatherData.icon === "sunny" ? SunIcon : CloudIcon;

  return (
    <Card className="h-fit">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ThermometerIcon className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-secondary-900">Weather</h2>
        </div>
        <div className="flex items-center gap-1 text-secondary-500">
          <MapPinIcon className="w-4 h-4" />
          <span className="text-sm">{weatherData.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400">
            <WeatherIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold text-secondary-900">{weatherData.temperature}°C</div>
            <div className="text-sm text-secondary-500">{weatherData.condition}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-secondary-200">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="text-secondary-500">Humidity:</span>
            <span className="font-medium text-secondary-700">{weatherData.humidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-secondary-500">Wind:</span>
            <span className="font-medium text-secondary-700">{weatherData.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;
