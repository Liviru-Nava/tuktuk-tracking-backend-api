//Controller layer for province endpoints

import * as provinceService from '../services/provinceService.js';
import { sendSuccess, sendError, sendCollection } from '../utils/responseUtils.js';

export async function getAllProvinces(req, res) {
  try {
    const collection = await provinceService.getAllProvinces(req.query, req.user);
    return sendCollection(res, 200, 'Provinces retrieved successfully', collection);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    console.error('[PROVINCE] getAllProvinces error:', err);
    return sendError(res, 500, 'Internal server error');
  }
}

export async function getProvinceById(req, res) {
  try {
    const province = await provinceService.getProvinceById(req.params.provinceId, req.user);
    return sendSuccess(res, 200, 'Province retrieved successfully', province);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    console.error('[PROVINCE] getProvinceById error:', err);
    return sendError(res, 500, 'Internal server error');
  }
}

export async function getDistrictsByProvince(req, res) {
  try {
    const result = await provinceService.getDistrictsByProvince(
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
    console.error('[PROVINCE] getDistrictsByProvince error:', err);
    return sendError(res, 500, 'Internal server error');
  }
}