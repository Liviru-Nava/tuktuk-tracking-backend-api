//Controller to manahe the district endpoints

import * as districtService from '../services/districtService.js';
import { sendSuccess, sendError, sendCollection } from '../utils/responseUtils.js';

export async function getAllDistricts(req, res) {
  try {
    const collection = await districtService.getAllDistricts(req.query, req.user);
    return sendCollection(res, 200, 'Districts retrieved successfully', collection);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    console.error('[DISTRICT] getAllDistricts error:', err);
    return sendError(res, 500, 'Internal server error');
  }
}

export async function getDistrictById(req, res) {
  try {
    const district = await districtService.getDistrictById(req.params.districtId, req.user);
    return sendSuccess(res, 200, 'District retrieved successfully', district);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    console.error('[DISTRICT] getDistrictById error:', err);
    return sendError(res, 500, 'Internal server error');
  }
}

export async function getDistrictsByProvince(req, res) {
  try {
    const result = await districtService.getDistrictsByProvince(
      req.params.provinceId,
      req.query,
      req.user,
    );
    return sendCollection(
      res, 200,
      `Districts in ${result.province.province_name} retrieved successfully`,
      result.collection,
    );
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    console.error('[DISTRICT] getDistrictsByProvince error:', err);
    return sendError(res, 500, 'Internal server error');
  }
}