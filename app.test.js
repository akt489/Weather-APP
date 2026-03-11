// app.test.js - Weather App API Tests
const request = require('supertest');
const app = require('./app');

describe('Weather App API Tests', () => {

  describe('Health Check Endpoint', () => {
    test('GET /health should return ok status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('cacheSize');
    });
  });

  describe('Weather Endpoint (/weather)', () => {
    test('GET /weather should require city parameter', async () => {
      const response = await request(app)
        .get('/weather')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('City name is required');
    });

    test('GET /weather with valid city should return weather data', async () => {
      const response = await request(app)
        .get('/weather?city=London')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('main');
      expect(response.body).toHaveProperty('weather');
      expect(response.body).toHaveProperty('sys');
    });

    test('GET /weather with invalid city should return 404', async () => {
      const response = await request(app)
        .get('/weather?city=InvalidCityXYZ123')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    test('GET /weather should cache results', async () => {
      // First request
      const response1 = await request(app)
        .get('/weather?city=Paris')
        .expect(200);

      expect(response1.body.fromCache).toBe(false);

      // Second request (should be cached)
      const response2 = await request(app)
        .get('/weather?city=Paris')
        .expect(200);

      expect(response2.body.fromCache).toBe(true);
    });

    test('GET /weather should trim city name', async () => {
      const response = await request(app)
        .get('/weather?city=%20%20New%20York%20%20')
        .expect(200);

      expect(response.body).toHaveProperty('name');
    });
  });

  describe('Forecast Endpoint (/forecast)', () => {
    test('GET /forecast should require city parameter', async () => {
      const response = await request(app)
        .get('/forecast')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('GET /forecast with valid city should return forecast data', async () => {
      const response = await request(app)
        .get('/forecast?city=London')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('list');
      expect(Array.isArray(response.body.list)).toBe(true);
      expect(response.body.list.length).toBeGreaterThan(0);
    });

    test('GET /forecast with invalid city should return 404', async () => {
      const response = await request(app)
        .get('/forecast?city=InvalidCityXYZ123')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    test('GET to non-existent endpoint should return 404', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
    });

    test('Responses should include proper headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('API Response Format', () => {
    test('Weather response should include all required fields', async () => {
      const response = await request(app)
        .get('/weather?city=Tokyo')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('coord');
      expect(response.body).toHaveProperty('main');
      expect(response.body).toHaveProperty('main.temp');
      expect(response.body).toHaveProperty('main.pressure');
      expect(response.body).toHaveProperty('main.humidity');
      expect(response.body).toHaveProperty('weather');
      expect(response.body).toHaveProperty('wind');
      expect(response.body).toHaveProperty('clouds');
      expect(response.body).toHaveProperty('sys');
    });

    test('Weather response should include cache flag', async () => {
      const response = await request(app)
        .get('/weather?city=Berlin')
        .expect(200);

      expect(response.body).toHaveProperty('fromCache');
      expect(typeof response.body.fromCache).toBe('boolean');
    });
  });

  describe('Data Validation', () => {
    test('Temperature should be in Kelvin (typical range: 250-330K)', async () => {
      const response = await request(app)
        .get('/weather?city=Sydney')
        .expect(200);

      const temp = response.body.main.temp;
      expect(temp).toBeGreaterThan(200);
      expect(temp).toBeLessThan(350);
    });

    test('Humidity should be between 0 and 100', async () => {
      const response = await request(app)
        .get('/weather?city=Mumbai')
        .expect(200);

      const humidity = response.body.main.humidity;
      expect(humidity).toBeGreaterThanOrEqual(0);
      expect(humidity).toBeLessThanOrEqual(100);
    });

    test('Pressure should be reasonable (900-1050 hPa)', async () => {
      const response = await request(app)
        .get('/weather?city=Cairo')
        .expect(200);

      const pressure = response.body.main.pressure;
      expect(pressure).toBeGreaterThan(500);
      expect(pressure).toBeLessThan(1200);
    });
  });
});
