//Business logic layer for district endpoints

import * as districtRepo from '../repositories/districtRepository.js';
import * as provinceRepo from '../repositories/provinceRepository.js';
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
    return buildCollection('/tuktrack/v1/districts', offset, limit, items.length, items);
  }

  // NATIONAL or PROVINCIAL — query with province filter if applicable
  const [districts, total] = await Promise.all([
    districtRepo.findAllDistricts({ limit, offset, province_id: filters.province_id }),
    districtRepo.countDistricts({ province_id: filters.province_id }),
  ]);

  return buildCollection(
    '/tuktrack/v1/districts',
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

export async function getDistrictsByProvince(provinceId, query, user) {
  if (!provinceId) {
    throw { statusCode: 400, message: 'Province ID is required' };
  }

  const province = await provinceRepo.findProvinceById(provinceId);
  if (!province) {
    throw { statusCode: 404, message: 'Province not found' };
  }

  // Re-use province-layer helper via the shared resolveAllowedProvinceId logic:
  // a non-national user may only see districts inside their own allowed province.
  if (user.jurisdiction_type !== 'NATIONAL') {
    let allowedProvinceId;

    if (user.jurisdiction_type === 'PROVINCIAL') {
      allowedProvinceId = user.jurisdiction_ref_id;
    } else {
      // DISTRICT or STATION — derive their province from their district
      const row = await districtRepo.findDistrictById(user.jurisdiction_ref_id);
      allowedProvinceId = row?.province_id ?? null;
    }

    if (allowedProvinceId && province.province_id !== allowedProvinceId) {
      throw { statusCode: 403, message: 'You do not have access to this province' };
    }
  }

  const { limit, offset } = getPaginationParams(query);
  const [districts, total] = await Promise.all([
    districtRepo.findDistrictsByProvinceId(provinceId, { limit, offset }),
    districtRepo.countDistrictsByProvinceId(provinceId),
  ]);

  return {
    province,
    collection: buildCollection(
      `/tuktrack/v1/provinces/${provinceId}/districts`,
      offset, limit, total, districts,
    ),
  };
}