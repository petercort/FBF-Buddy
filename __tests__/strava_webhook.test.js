import request from 'supertest';
import app from '../src/strava_webhook';
import { UsersTable, BikesTable } from '../src/dbObjects';
import axios from 'axios';

jest.mock('../src/dbObjects', () => ({
  UsersTable: { findOne: jest.fn() },
  BikesTable: { update: jest.fn(), findOne: jest.fn() },
}));

jest.mock('axios');

describe('Strava Webhook', () => {
  it('should handle activity creation events', async () => {
    UsersTable.findOne.mockResolvedValue({ dataValues: { userId: '12345' } });
    axios.get.mockResolvedValueOnce({ data: { gear: { id: 'bike123', distance: 10000 } } });
    BikesTable.findOne.mockResolvedValue({ dataValues: { lastWaxedDistance: 5000 } });

    const response = await request(app)
      .post('/webhook')
      .send({ object_type: 'activity', aspect_type: 'create', owner_id: '12345', object_id: 'ride123' });

    expect(response.status).toBe(200);
    expect(UsersTable.findOne).toHaveBeenCalledWith({ where: { strava_user_id: '12345' } });
    expect(BikesTable.update).toHaveBeenCalled();
  });

  it('should return 200 for unsupported events', async () => {
    const response = await request(app)
      .post('/webhook')
      .send({ object_type: 'unsupported', aspect_type: 'create' });

    expect(response.status).toBe(200);
  });
});