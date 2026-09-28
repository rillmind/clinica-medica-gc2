import request from 'supertest';
import app from '../src/app';

describe('Health Check Endpoint', () => {
  it('GET /health deve retornar status 200 com status "ok" e timestamp', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
