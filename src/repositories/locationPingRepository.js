// Handles all direct database interactions for location_pings table.

import db from '../config/knex.js';

// Insert a single new location ping record into the database.
export async function insertLocationPing(newPingData) {
    const [insertedPing] = await db('location_pings')
        .insert(newPingData)
        .returning('*');

    return insertedPing;
};
