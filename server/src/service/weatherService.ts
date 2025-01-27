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
        return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`; // Corrected endpoint
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
        console.log(response);
        if (!response.ok) {
            throw new Error('Failed to fetch Forecast Data');
        }
        const datastuff = await response.json();
        console.log(datastuff);
        return datastuff;
    }
    // Build parseCurrentWeather method
    parseCurrentWeather(response: any) {
        return new Weather(
            response.id, // Use the id for easy identification
            response.name,
            new Date().toLocaleDateString(),
            response.weather[0].description,
            response.main.temp,
            response.main.feels_like,
            response.main.humidity,
            response.wind.speed,
            response.weather[0].icon
        );
    }
    // Complete buildForecastArray method
    buildForecastArray(forecastData: any) {
        
        return forecastData.list.filter((data: any) => data.dt_txt?.includes('12:00:00')).map((data: any, index: number) => { // Access forecastData.list
            return new Weather(
                `${forecastData.city.id}-${index}`, // Use a unique identifier
                forecastData.city.name, // Access city name
                new Date(data.dt * 1000).toLocaleDateString(), // Convert timestamp to date
                data.weather[0].description,
                data.main.temp, // Access temperature correctly
                data.main.feels_like, // Access feels_like correctly
                data.main.humidity,
                data.wind.speed, // Access wind speed correctly
                data.weather[0].icon
            );
        });
    }
    // Complete getWeatherForCity method
    async getWeatherForCity(cityName: string) {
        const coordinates = await this.fetchAndDestructureLocationData(cityName);
        console.log(coordinates);
        const weatherData = await this.fetchWeatherData(coordinates);
        console.log(weatherData);
        const forecastData = await this.fetchForecastData(coordinates);
        console.log(forecastData);
        const currentWeather = this.parseCurrentWeather(weatherData);
        //console.log(currentWeather)
        const forecast = this.buildForecastArray(forecastData); 
        //console.log(forecast)
        return [currentWeather, ...forecast];
    }
}
export default new WeatherService();
