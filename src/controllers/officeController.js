//Office controllers to handle requests and responses. 

import * as officeService from '../services/officeService.js';
import { sendSuccess, sendCollection, sendError } from '../utils/responseUtils.js';

//get all offices with collection format
export async function getAllOffices(req, res) {
    try {
        const office_collection = await officeService.getAllOffices(req.query, req.user);
        return sendCollection(res, 200, 'Offices retrieved successfully', office_collection);
    } catch (err) {
        if (err.statusCode) return sendError(res, err.statusCode, err.message);
        console.error('[OFFICE] getAllOffices error:', err);
        return sendError(res, 500, 'Internal server error');
    }
}

//get office by id
export async function getOfficeById(req, res) {
    try {
        const office = await officeService.getOfficeById(req.params.officeId, req.user);
        return sendSuccess(res, 200, 'Office retrieved successfully', office);
    } catch (err) {
        if (err.statusCode) return sendError(res, err.statusCode, err.message);
        console.error('[OFFICE] getOfficeById error:', err);
        return sendError(res, 500, 'Internal server error');
    }
}

//create a new office
export async function createOffice(req, res) {
    try {
        const office = await officeService.createOffice(req.body, req.user);
        return sendSuccess(res, 201, 'Office created successfully', office);
    } catch (err) {
        if (err.statusCode) return sendError(res, err.statusCode, err.message);
        console.error('[OFFICE] createOffice error:', err);
        return sendError(res, 500, 'Internal server error');
    }
}

//update the office status or details
export async function updateOffice(req, res) {
    try {
        const office = await officeService.updateOffice(
        req.params.officeId,
        req.body,
        req.user,
        );
        return sendSuccess(res, 200, 'Office updated successfully', office);
    } catch (err) {
        if (err.statusCode) return sendError(res, err.statusCode, err.message);
        console.error('[OFFICE] updateOffice error:', err);
        return sendError(res, 500, 'Internal server error');
    }
}

//close the office
export async function deleteOffice(req, res) {
    try {
        const result = await officeService.deleteOffice(req.params.officeId, req.user);
        return sendSuccess(res, 200, 'Office closed successfully', result);
    } catch (err) {
        if (err.statusCode) return sendError(res, err.statusCode, err.message);
        console.error('[OFFICE] deleteOffice error:', err);
        return sendError(res, 500, 'Internal server error');
    }
}

//get the users in an office
export async function getOfficeUsers(req, res) {
    try {
        const result = await officeService.getOfficeUsers(
        req.params.officeId,
        req.query,
        req.user,
        );
        return sendCollection(
        res, 200,
        `Users in ${result.office.office_name} retrieved successfully`,
        result.collection,
        );
    } catch (err) {
        if (err.statusCode) return sendError(res, err.statusCode, err.message);
        console.error('[OFFICE] getOfficeUsers error:', err);
        return sendError(res, 500, 'Internal server error');
    }
}