//Business logic layer for district endpoints

import * as districtRepo from '../repositories/districtRepository.js';
import db from '../config/knex.js';
import { getPaginationParams, buildCollection } from '../utils/paginationUtils.js';

async function getProvinceIdForDistrict(districtId) {
  const result = await db('districts')
    .where({ district_id: districtId })
    .select('province_id')
    .first();
  return result?.province_id;
}

// Returns the filters to apply based on user jurisdiction
async function resolveDistrictFilters(user) {
  if (user.jurisdiction_type === 'NATIONAL') {
    return {}; // no filter
  }

  if (user.jurisdiction_type === 'PROVINCIAL') {
    return { province_id: user.jurisdiction_ref_id };
  }

  // DISTRICT or STATION — only their specific district
  if (
    user.jurisdiction_type === 'DISTRICT' ||
    user.jurisdiction_type === 'STATION'
  ) {
    return { district_id: user.jurisdiction_ref_id };
  }

  return {};
}

async function checkDistrictAccess(user, districtId, provinceId) {
  if (user.jurisdiction_type === 'NATIONAL') return;

  if (user.jurisdiction_type === 'PROVINCIAL') {
    if (provinceId !== user.jurisdiction_ref_id) {
      throw { statusCode: 403, message: 'You do not have access to this district' };
    }
    return;
  }

  // DISTRICT or STATION
  if (user.jurisdiction_ref_id !== districtId) {
    throw { statusCode: 403, message: 'You do not have access to this district' };
  }
}

export async function getAllDistricts(query, user) {
  const { limit, offset } = getPaginationParams(query);
  const filters = await resolveDistrictFilters(user);

  // DISTRICT/STATION user — return only their single district
  if (filters.district_id) {
    const district = await districtRepo.findDistrictById(filters.district_id);
    const items    = district ? [district] : [];
    return buildCollection('/api/v1/districts', offset, limit, items.length, items);
  }

  // NATIONAL or PROVINCIAL — query with province filter if applicable
  const [districts, total] = await Promise.all([
    districtRepo.findAllDistricts({ limit, offset, province_id: filters.province_id }),
    districtRepo.countDistricts({ province_id: filters.province_id }),
  ]);

  return buildCollection(
    '/api/v1/districts',
    offset,
    limit,
    total,
    districts,
    filters.province_id ? { province_id: filters.province_id } : {},
  );
}

export async function getDistrictById(districtId, user) {
  if (!districtId) {
    throw { statusCode: 400, message: 'District ID is required' };
  }

  const district = await districtRepo.findDistrictById(districtId);

  // Resource does not exist
  if (!district) {
    throw { statusCode: 404, message: 'District not found' };
  }

  // Resource exists but user cannot access it
  await checkDistrictAccess(user, districtId, district.province_id);

  return district;
}

export async function getOfficesByDistrict(districtId, query, user) {
  if (!districtId) {
    throw { statusCode: 400, message: 'District ID is required' };
  }

  const district = await districtRepo.findDistrictById(districtId);
  if (!district) {
    throw { statusCode: 404, message: 'District not found' };
  }

  await checkDistrictAccess(user, districtId, district.province_id);

  const { limit, offset } = getPaginationParams(query);
  const [offices, total] = await Promise.all([
    districtRepo.findOfficesByDistrictId(districtId, { limit, offset }),
    districtRepo.countOfficesByDistrictId(districtId),
  ]);

  return {
    district,
    collection: buildCollection(
      `/api/v1/districts/${districtId}/offices`,
      offset, limit, total, offices,
    ),
  };
}