import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object

// TODO: Define a class for the Weather object

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  // TODO: Create fetchLocationData method
  // private async fetchLocationData(query: string) {}
  // TODO: Create destructureLocationData method
  // private destructureLocationData(locationData: Coordinates): Coordinates {}
  // TODO: Create buildGeocodeQuery method
  // private buildGeocodeQuery(): string {}
  // TODO: Create buildWeatherQuery method
  // private buildWeatherQuery(coordinates: Coordinates): string {}
  // TODO: Create fetchAndDestructureLocationData method
  // private async fetchAndDestructureLocationData() {}
  // TODO: Create fetchWeatherData method
  // private async fetchWeatherData(coordinates: Coordinates) {}
  // TODO: Build parseCurrentWeather method
  // private parseCurrentWeather(response: any) {}
  // TODO: Complete buildForecastArray method
  // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}
  // TODO: Complete getWeatherForCity method
  // async getWeatherForCity(city: string) {}
}

export default new WeatherService();



//maybe
import dotenv from 'dotenv';
dotenv.config();
// Define a class for the Weather object
class Weather {
    constructor(id, city, date, description, temp, feelsLike, humidity, windSpeed, icon) {
        this.id = id;
        this.city = city;
        this.date = date;
        this.description = description;
        this.temp = temp;
        this.feelsLike = feelsLike;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.icon = icon;
    }
}
// Complete the WeatherService class
class WeatherService {
    constructor() {
        this.baseURL = 'https://api.openweathermap.org/';
        this.apiKey = process.env.WEATHER_API_KEY || '';
        if (!this.apiKey) {
            throw new Error('Weather API key is required');
        }
    }
    // Create fetchLocationData method
    async fetchLocationData(city) {
        const query = `${this.buildGeocodeQuery(city)}`; //creates url
        const response = await fetch(query); //grabs information from api request
        if (!response.ok) {
            throw new Error('Failed to fetch location data');
        }
        const locationData = await response.json();
        if (locationData.length === 0) {
            throw new Error('Location not found');
        }
        return locationData[0];
    }
    // Create destructureLocationData method
    destructureLocationData(locationData) {
        return {
            lat: locationData.lat,
            lon: locationData.lon,
        };
    }
    // buildGeocodeQuery method
    buildGeocodeQuery(city) {
        return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.apiKey}`;
    }
    // buildWeatherQuery method
    buildWeatherQuery(coordinates) {
        return `${this.baseURL}/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
    }
    // fetchAndDestructureLocationData method that fetches and destructures location data using the above methods
    async fetchAndDestructureLocationData(city) {
        this.fetchLocationData(city);
        const locationData = await this.fetchLocationData(city);
        return this.destructureLocationData(locationData);
    }
    // Create fetchWeatherData method
    async fetchWeatherData(coordinates) {
        const query = this.buildWeatherQuery(coordinates);
        const response = await fetch(query);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return await response.json();
    }
    // Build parseCurrentWeather method
    parseCurrentWeather(response) {
        return new Weather(0, response.name, new Date().toLocaleDateString(), response.weather[0].description, response.main.temp, response.main.feels_like, response.main.humidity, response.wind.speed, response.weather[0].icon);
    }
    ;
    // Complete buildForecastArray method
    buildForecastArray(currentWeather, weatherData) {
        return weatherData.map((data, index) => {
            return new Weather(index + 1, currentWeather.city, data.dt_txt, data.weather[0].description, data.main.temp, data.main.feels_like, data.main.humidity, data.wind.speed, data.weather[0].icon);
        }, []);
    }
    // Complete getWeatherForCity method
    async getWeatherForCity(city) {
        const coordinates = await this.fetchAndDestructureLocationData(city);
        const weatherData = await this.fetchWeatherData(coordinates);
        const currentWeather = this.parseCurrentWeather(weatherData);
        const forecast = this.buildForecastArray(currentWeather, weatherData.list);
        return [currentWeather, ...forecast];
    }
}
export default new WeatherService();
