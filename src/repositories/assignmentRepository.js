import db from '../config/knex.js';

export async function findDriverAssignmentsByVehicleId(vehicleId, { limit, offset }) {
  const assignmentsQuery = db('vehicle_driver_assignments')
    .join('drivers','vehicle_driver_assignments.driver_id','drivers.driver_id')
    .where('vehicle_driver_assignments.vehicle_id', vehicleId)
    .select(
      'vehicle_driver_assignments.assignment_id',
      'vehicle_driver_assignments.vehicle_id',
      'vehicle_driver_assignments.driver_id',
      'vehicle_driver_assignments.assigned_time',
      'vehicle_driver_assignments.unassigned_time',
      'vehicle_driver_assignments.is_current_driver',
      'vehicle_driver_assignments.is_driver_owner',
      'drivers.driver_fullname',
      'drivers.driver_identity_no',
      'drivers.driver_id_type',
      'drivers.driver_license_no',
      'drivers.status as driver_status',
    )
    .orderBy('vehicle_driver_assignments.assigned_time', 'desc');

  const totalCountResult = await db('vehicle_driver_assignments')
    .where({ vehicle_id: vehicleId })
    .count('assignment_id as count')
    .first();

  const listOfAssignments = await assignmentsQuery.limit(limit).offset(offset);
  const totalAssignmentCount = parseInt(totalCountResult.count);
  return { listOfAssignments, totalAssignmentCount };
}

export async function findAssignmentByIdAndVehicleId(assignmentId, vehicleId) {
  return db('vehicle_driver_assignments')
    .join('drivers','vehicle_driver_assignments.driver_id','drivers.driver_id')
    .where({
      'vehicle_driver_assignments.assignment_id': assignmentId,
      'vehicle_driver_assignments.vehicle_id': vehicleId,
    })
    .select(
      'vehicle_driver_assignments.assignment_id',
      'vehicle_driver_assignments.vehicle_id',
      'vehicle_driver_assignments.driver_id',
      'vehicle_driver_assignments.assigned_time',
      'vehicle_driver_assignments.unassigned_time',
      'vehicle_driver_assignments.is_current_driver',
      'vehicle_driver_assignments.is_driver_owner',
      'drivers.driver_fullname',
      'drivers.driver_identity_no',
      'drivers.driver_license_no',
      'drivers.status as driver_status',
    )
    .first();
}
