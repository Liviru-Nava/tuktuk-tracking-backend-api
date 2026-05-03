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

// Get all districts belonging to a province — scoped collection for GET /provinces/:provinceId/districts
export async function findDistrictsByProvinceId(provinceId, { limit, offset } = {}) {
  return db('districts')
    .where({ province_id: provinceId })
    .select(
      'district_id',
      'province_id',
      'district_name',
      'district_code',
      'created_time',
    )
    .orderBy('district_name', 'asc')
    .limit(limit)
    .offset(offset);
}

export async function countDistrictsByProvinceId(provinceId) {
  const result = await db('districts')
    .where({ province_id: provinceId })
    .count('district_id as count')
    .first();
  return parseInt(result.count);
}