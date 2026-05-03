//Database logic for Provinces

import db from '../config/knex.js';

// Get total count — used for pagination meta
export async function countProvinces(filters = {}) {
  const query = db('provinces');

  if (filters.province_id) {
    query.where('province_id', filters.province_id);
  }

  const result = await query.count('province_id as count').first();
  return parseInt(result.count);
}

// Get all provinces with optional filtering
export async function findAllProvinces({ limit, offset } = {}) {
  return db('provinces')
    .select(
      'province_id',
      'province_name',
      'province_code',
      'created_time',
    )
    .orderBy('province_name', 'asc')
    .limit(limit)
    .offset(offset);
}

// Get a single province by ID
export async function findProvinceById(provinceId) {
  return db('provinces')
    .where({ province_id: provinceId })
    .select(
      'province_id',
      'province_name',
      'province_code',
      'created_time',
    )
    .first();
}