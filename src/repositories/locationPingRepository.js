// Handles all direct database interactions for location_pings table.

import db from '../config/knex.js';

// Insert a single new location ping record into the database.
export async function insertLocationPing(newPingData) {
    const [insertedPing] = await db('location_pings')
        .insert(newPingData)
        .returning('*');

    return insertedPing;
};

export async function findLocationPingsByVehicleId(vehicleId, { limit, offset, startTime, endTime }) {
  const vehicleWithDevice = await db('vehicles')
    .where({ vehicle_id: vehicleId }).select('device_id').first();
  if (!vehicleWithDevice || !vehicleWithDevice.device_id)
    return { listOfPings: [], totalPingCount: 0 };

  const deviceId = vehicleWithDevice.device_id;
  const pingsQuery = db('location_pings')
    .where({ device_id: deviceId })
    .select('ping_id','device_id','latitude','longitude','ping_timestamp','speed_kmh','device_battery')
    .orderBy('ping_timestamp','desc');
  const countQuery = db('location_pings').where({ device_id: deviceId });

  if (startTime) { pingsQuery.where('ping_timestamp','>=',startTime); countQuery.where('ping_timestamp','>=',startTime); }
  if (endTime)   { pingsQuery.where('ping_timestamp','<=',endTime);   countQuery.where('ping_timestamp','<=',endTime);   }

  const listOfPings = await pingsQuery.limit(limit).offset(offset);
  const totalCountResult = await countQuery.count('ping_id as count').first();
  return { listOfPings, totalPingCount: parseInt(totalCountResult.count) };
}

export async function findLastKnownLocationByVehicleId(vehicleId) {
  const vehicleWithDevice = await db('vehicles')
    .where({ vehicle_id: vehicleId }).select('device_id').first();
  if (!vehicleWithDevice || !vehicleWithDevice.device_id) return null;

  return db('location_pings')
    .where({ device_id: vehicleWithDevice.device_id })
    .orderBy('ping_timestamp','desc')
    .select('ping_id','device_id','latitude','longitude','ping_timestamp','speed_kmh','device_battery')
    .first();
}
