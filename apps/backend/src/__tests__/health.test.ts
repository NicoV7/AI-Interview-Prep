import request from 'supertest';
import { app } from '../index';

describe('Health Endpoint', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
    expect(typeof response.body.uptime).toBe('number');
    expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
  });

  it('should return valid timestamp format', async () => {
    const response = await request(app).get('/health');
    
    const timestamp = response.body.timestamp;
    const date = new Date(timestamp);
    
    expect(date.toISOString()).toBe(timestamp);
  });
});