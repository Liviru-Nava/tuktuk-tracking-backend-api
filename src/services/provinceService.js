//Business logic layer for the Province endpoints

import * as provinceRepo from '../repositories/provinceRepository.js';
import db from '../config/knex.js';
import { getPaginationParams, buildCollection } from '../utils/paginationUtils.js';


async function getProvinceIdByDistrictId(districtId) {
  const result = await db('districts')
    .where({ district_id: districtId })
    .select('province_id')
    .first();
  return result?.province_id;
}

// Returns the province_id the user is allowed to see
async function resolveAllowedProvinceId(user) {
  if (user.jurisdiction_type === 'NATIONAL') {
    return null; // no filter — sees everything
  }

  if (user.jurisdiction_type === 'PROVINCIAL') {
    return user.jurisdiction_ref_id; // their province directly
  }

  // DISTRICT or STATION — look up which province their district belongs to
  if (
    user.jurisdiction_type === 'DISTRICT' ||
    user.jurisdiction_type === 'STATION'
  ) {
    return await getProvinceIdByDistrictId(user.jurisdiction_ref_id);
  }

  return null;
}

export async function getAllProvinces(query, user) {
  const { limit, offset }   = getPaginationParams(query);
  const allowedProvinceId   = await resolveAllowedProvinceId(user);

  let provinces;
  let total;

  if (allowedProvinceId) {
    // Non-national user — filter to their single province
    const province = await provinceRepo.findProvinceById(allowedProvinceId);
    provinces = province ? [province] : [];
    total     = provinces.length;
  } else {
    // National user — return all
    [provinces, total] = await Promise.all([
      provinceRepo.findAllProvinces({ limit, offset }),
      provinceRepo.countProvinces(),
    ]);
  }

  return buildCollection(
    '/api/v1/provinces',
    offset,
    limit,
    total,
    provinces,
  );
}

export async function getProvinceById(provinceId, user) {
  // Validate the ID was actually provided
  if (!provinceId) {
    throw { statusCode: 400, message: 'Province ID is required' };
  }

  console.log('Fetching province with ID:', provinceId);
  console.log('User jurisdiction:', user.jurisdiction_type, user.jurisdiction_ref_id);

  const province = await provinceRepo.findProvinceById(provinceId);
  console.log('Fetched province:', province);

  // Resource does not exist at all
  if (!province) {
    throw { statusCode: 404, message: 'Province not found' };
  }

  // Resource exists but user has no jurisdiction access
  const allowedProvinceId = await resolveAllowedProvinceId(user);
  console.log('Allowed province ID:', allowedProvinceId);
  
  if (allowedProvinceId && province.province_id !== allowedProvinceId) {
    throw { statusCode: 403, message: 'You do not have access to this province' };
  }

  console.log('Returning province:', province);
  return province;
}

export async function getDistrictsByProvince(provinceId, query, user) {
  if (!provinceId) {
    throw { statusCode: 400, message: 'Province ID is required' };
  }

  const province = await provinceRepo.findProvinceById(provinceId);
  if (!province) {
    throw { statusCode: 404, message: 'Province not found' };
  }

  const allowedProvinceId = await resolveAllowedProvinceId(user);
  if (allowedProvinceId && province.province_id !== allowedProvinceId) {
    throw { statusCode: 403, message: 'You do not have access to this province' };
  }

  const { limit, offset } = getPaginationParams(query);
  const [districts, total] = await Promise.all([
    provinceRepo.findDistrictsByProvinceId(provinceId, { limit, offset }),
    provinceRepo.countDistrictsByProvinceId(provinceId),
  ]);

  return {
    province,
    collection: buildCollection(
      `/api/v1/provinces/${provinceId}/districts`,
      offset, limit, total, districts,
    ),
  };
}