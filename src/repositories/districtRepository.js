//Repository for Districts

import db from '../config/knex.js';

export async function countDistricts(filters = {}) {
  const query = db('districts');

  if (filters.province_id) {
    query.where('province_id', filters.province_id);
  }

  const result = await query.count('district_id as count').first();
  return parseInt(result.count);
}

export async function findAllDistricts({ limit, offset, province_id } = {}) {
  const query = db('districts')
    .join('provinces', 'districts.province_id', 'provinces.province_id')
    .select(
      'districts.district_id',
      'districts.province_id',
      'provinces.province_name',
      'provinces.province_code',
      'districts.district_name',
      'districts.district_code',
      'districts.created_time',
    )
    .orderBy('districts.district_name', 'asc');

  if (province_id) {
    query.where('districts.province_id', province_id);
  }

  return query.limit(limit).offset(offset);
}

export async function findDistrictById(districtId) {
  return db('districts')
    .join('provinces', 'districts.province_id', 'provinces.province_id')
    .where('districts.district_id', districtId)
    .select(
      'districts.district_id',
      'districts.province_id',
      'provinces.province_name',
      'provinces.province_code',
      'districts.district_name',
      'districts.district_code',
      'districts.created_time',
    )
    .first();
}

// Get all offices in a district
export async function findOfficesByDistrictId(districtId, { limit, offset } = {}) {
  return db('offices')
    .where({
      jurisdiction_ref_id: districtId,
      jurisdiction_type:   'DISTRICT',
    })
    .select(
      'office_id',
      'office_code',
      'office_name',
      'office_type',
      'jurisdiction_type',
      'jurisdiction_ref_id',
      'office_address',
      'office_contact',
      'status',
      'created_time',
      'updated_time',
    )
    .orderBy('office_name', 'asc')
    .limit(limit)
    .offset(offset);
}

export async function countOfficesByDistrictId(districtId) {
  const result = await db('offices')
    .where({
      jurisdiction_ref_id: districtId,
      jurisdiction_type:   'DISTRICT',
    })
    .count('office_id as count')
    .first();
  return parseInt(result.count);
}