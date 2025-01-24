import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
    lat: number;
    lon: number;
}
// Define a class for the Weather object
class Weather {
    id: string;
    cityName: string;
    date: string;
    description: string;
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    icon: string;

    constructor(
        id: string,
        cityName: string,
        date: string,
        description: string,
        temp: number,
        feelsLike: number,
        humidity: number,
        windSpeed: number,
        icon: string
    ) {
        this.id = id;
        this.cityName = cityName;
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
    baseURL: string;
    apiKey: string;

    constructor() {
        this.baseURL = process.env.API_BASE_URL ||'https://api.openweathermap.org/';
        this.apiKey = process.env.API_KEY || '';
        if (!this.apiKey) {
            throw new Error('Weather API key is required');
        }
    }
    // Create fetchLocationData method
    async fetchLocationData(cityName: string) {
        const query = `${this.buildGeocodeQuery(cityName)}`; //creates url
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
    destructureLocationData(locationData: Coordinates) {
        return {
            lat: locationData.lat,
            lon: locationData.lon,
        };
    }
    // buildGeocodeQuery method
    buildGeocodeQuery(cityName: string) {
        return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${this.apiKey}`;
    }
    // buildWeatherQuery method
    buildWeatherQuery(coordinates: Coordinates) {
        return `${this.baseURL}/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
    }

    buildForecastQuery(coordinates: Coordinates) {
        return `${this.baseURL}/data/2.5/forecast/daily?lat=${coordinates.lat}&lon=${coordinates.lon}&cnt=5&units=imperial&appid=${this.apiKey}`;
    }

    // fetchAndDestructureLocationData method that fetches and destructures location data using the above methods
    async fetchAndDestructureLocationData(cityName: string) {
        const locationData = await this.fetchLocationData(cityName);
        return this.destructureLocationData(locationData);
    }
    // Create fetchWeatherData method
    async fetchWeatherData(coordinates: Coordinates) {
        const query = this.buildWeatherQuery(coordinates);
        const response = await fetch(query);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return await response.json();
    }

    //fetch forecast data
    async fetchForecastData(coordinates: Coordinates) {
        const query = this.buildForecastQuery(coordinates); //build the query
        const response = await fetch(query);
        if (!response.ok) {
            throw new Error('Failed to fetch Forecast Data');
        }
        return await response.json
    }
    // Build parseCurrentWeather method
    parseCurrentWeather(response) {
        return new Weather(
            0,
            response.name,
            new Date().toLocaleDateString(),
            response.weather[0].description,
            response.main.temp,
            response.main.feels_like,
            response.main.humidity,
            response.wind.speed,
            response.weather[0].icon);
    }
    ;
    // Complete buildForecastArray method
    buildForecastArray(
        currentWeather: Weather, weatherData: Coordinates) {
        return weatherData.map((data, index) => {
            return new Weather(
                index + 1,
                currentWeather.city,
                data.dt_txt,
                data.weather[0].description,
                data.main.temp,
                data.main.feels_like,
                data.main.humidity,
                data.wind.speed,
                data.weather[0].icon
            );
        }, []);
    }
    // Complete getWeatherForCity method
    async getWeatherForCity(cityName: string) {
        const coordinates = await this.fetchAndDestructureLocationData(cityName);
        const weatherData = await this.fetchWeatherData(coordinates);
        const forecastData = await this.fetchForecastData(coordinates);
        const currentWeather = this.parseCurrentWeather(weatherData);
        const forecast = this.buildForecastArray(currentWeather, forecastData.list);
        return [currentWeather, ...forecast];
    }
}
export default new WeatherService();
