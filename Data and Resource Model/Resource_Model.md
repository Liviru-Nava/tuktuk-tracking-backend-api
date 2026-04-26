# API Resource Model — Tuk-Tuk Tracking System

**Base Path:** `/api/v1`  
**Auth Scheme:** JWT Bearer Token

---

## Role Definitions

| Role Key | Description |
|---|---|
| `Public` | Unauthenticated access. Limited to read-only reference data (provinces). |
| `Device` | Authenticated tracking device. Can only submit location pings for its assigned vehicle. |
| `Officer` | Station-level police officer. Scoped to their assigned station/district. |
| `Provincial` | Provincial-level officer (e.g., CID). Scoped to their assigned province. |
| `Admin` | District or station administrator. Can manage local records and user accounts. |
| `National Admin` | Police HQ / national-level administrator. Full system access. |

> `Officer+` means the endpoint is accessible by Officer, Provincial, Admin, and National Admin. Results are further filtered by each user's `access_scope_type` and `access_ref_id`.

---

## 1. Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticates user, returns JWT access token and refresh token. | Public |
| `POST` | `/api/v1/auth/logout` | Invalidates the current JWT token. | Authenticated |
| `POST` | `/api/v1/auth/refresh` | Issues a new access token using a valid refresh token. | Authenticated |

---

## 2. Users

**Fields:** `user_id`, `badge_id`, `first_name`, `middle_name`, `surname`, `email_address`, `contact_no`, `role`, `access_scope`, `access_scope_type`, `access_ref_id`, `is_active`, `last_login_time`, `created_time`, `updated_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/users` | Returns paginated list of all users. Supports `?role=`, `?is_active=`, `?offset=`, `?limit=`. | National Admin |
| `POST` | `/api/v1/users` | Creates a new user account. | National Admin |
| `GET` | `/api/v1/users/{user-id}` | Returns a single user record with all fields above. | Admin / Self |
| `PUT` | `/api/v1/users/{user-id}` | Full replacement update of a user record. | Admin |
| `DELETE` | `/api/v1/users/{user-id}` | Soft deletes a user by setting `is_active = false`. | National Admin |
| `POST` | `/api/v1/users/{user-id}/deactivate` | Sets `is_active = false` without a full PUT payload. | National Admin |

---

## 3. Owners

**Fields:** `owner_id`, `owner_firstname`, `owner_middlename`, `owner_surname`, `owner_nic`, `owner_contact`, `owner_address`, `created_time`, `updated_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/owners` | Returns paginated list of all owners. Supports `?offset=`, `?limit=`. | Officer+ |
| `POST` | `/api/v1/owners` | Registers a new vehicle owner. | Officer+ |
| `GET` | `/api/v1/owners/{owner-id}` | Returns a single owner record with all fields above. | Officer+ |
| `PUT` | `/api/v1/owners/{owner-id}` | Full replacement update of an owner record. | Officer+ |
| `DELETE` | `/api/v1/owners/{owner-id}` | Removes an owner record with no active vehicles. | Admin |
| `GET` | `/api/v1/owners/{owner-id}/vehicles` | Returns all vehicles registered under this owner. | Officer+ |

---

## 4. Vehicles

**Fields:** `vehicle_id`, `vehicle_reg_no`, `chassis_number`, `make_of_vehicle`, `model_of_vehicle`, `color_of_vehicle`, `fuel_type`, `year_of_manufacture`, `vehicle_reg_date`, `status_by_police`, `created_time`, `updated_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/vehicles` | Returns paginated list of vehicles. Supports `?province-id=`, `?district-id=`, `?station-id=`, `?status=`, `?offset=`, `?limit=`. | Officer+ |
| `POST` | `/api/v1/vehicles` | Registers a new vehicle. | Officer+ |
| `GET` | `/api/v1/vehicles/{vehicle-id}` | Returns a single vehicle record with all fields above. | Officer+ |
| `PUT` | `/api/v1/vehicles/{vehicle-id}` | Full replacement update of a vehicle record. | Officer+ |
| `DELETE` | `/api/v1/vehicles/{vehicle-id}` | Removes a vehicle with no active device or driver assignment. | Admin |
| `GET` | `/api/v1/vehicles/{vehicle-id}/profile` | Composite — returns vehicle + owner + current driver + assigned station + active device. | Officer+ |
| `GET` | `/api/v1/vehicles/{vehicle-id}/drivers` | Returns all driver assignment records for this vehicle. | Officer+ |
| `GET` | `/api/v1/vehicles/{vehicle-id}/tracking-devices` | Returns all tracking devices fitted to this vehicle. | Officer+ |
| `GET` | `/api/v1/vehicles/{vehicle-id}/location-pings` | Returns GPS location history. Supports `?from=`, `?to=` (ISO 8601), `?offset=`, `?limit=`. | Officer+ |
| `GET` | `/api/v1/vehicles/{vehicle-id}/last-location` | Returns the single most recent GPS ping for this vehicle. | Officer+ |
| `POST` | `/api/v1/vehicles/{vehicle-id}/update-status` | Updates `status_by_police` only. Generates an audit log entry. | Officer+ |
| `GET` | `/api/v1/vehicles/{vehicle-id}/assignments/{assignment-id}` | Returns a single assignment record with `assignment_id`, `assigned_time`, `unassigned_time`, `is_driver_owner`, `is_current_driver`. | Officer+ |

---

## 5. Drivers

**Fields:** `driver_id`, `first_name`, `middle_name`, `surname`, `address`, `driver_license_no`, `license_expiry_date`, `driver_gender`, `status_by_police`, `created_time`, `updated_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/drivers` | Returns paginated list of drivers. Supports `?status=`, `?offset=`, `?limit=`. | Officer+ |
| `POST` | `/api/v1/drivers` | Registers a new driver. | Officer+ |
| `GET` | `/api/v1/drivers/{driver-id}` | Returns a single driver record with all fields above. | Officer+ |
| `PUT` | `/api/v1/drivers/{driver-id}` | Full replacement update of a driver record. | Officer+ |
| `DELETE` | `/api/v1/drivers/{driver-id}` | Removes a driver with no active vehicle assignment. | Admin |
| `POST` | `/api/v1/drivers/{driver-id}/update-status` | Updates `status_by_police` or `license_expiry_date` only. Generates an audit log entry. | Officer+ |

---

## 6. Police Stations

**Fields:** `station_id`, `station_name`, `station_contact`, `station_address`, `station_loc_latitude`, `station_loc_longitude`, `station_boundary`, `created_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/police-stations` | Returns paginated list of stations. Supports `?district-id=`, `?offset=`, `?limit=`. | Officer+ |
| `POST` | `/api/v1/police-stations` | Creates a new police station. | National Admin |
| `GET` | `/api/v1/police-stations/{station-id}` | Returns a single station record with all fields above. | Officer+ |
| `PUT` | `/api/v1/police-stations/{station-id}` | Full replacement update of a station record. | National Admin |
| `DELETE` | `/api/v1/police-stations/{station-id}` | Removes a station with no assigned users or vehicles. | National Admin |
| `GET` | `/api/v1/police-stations/{station-id}/vehicles` | Returns all vehicles under this station's jurisdiction. | Officer+ |

---

## 7. Provinces

**Fields:** `province_id`, `province_name`, `province_code`, `province_boundary`, `created_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/provinces` | Returns list of all 9 provinces. | Public |
| `POST` | `/api/v1/provinces` | Creates a new province record. | National Admin |
| `GET` | `/api/v1/provinces/{province-id}` | Returns a single province record with all fields above. | Public |
| `PUT` | `/api/v1/provinces/{province-id}` | Full replacement update of a province record. | National Admin |
| `GET` | `/api/v1/provinces/{province-id}/districts` | Returns all districts belonging to this province. | Officer+ |

---

## 8. Districts

**Fields:** `district_id`, `district_name`, `district_code`, `district_boundary`, `created_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/districts` | Returns list of all 25 districts. Supports `?province-id=`, `?offset=`, `?limit=`. | Officer+ |
| `POST` | `/api/v1/districts` | Creates a new district record. | National Admin |
| `GET` | `/api/v1/districts/{district-id}` | Returns a single district record with all fields above. | Officer+ |
| `PUT` | `/api/v1/districts/{district-id}` | Full replacement update of a district record. | National Admin |
| `GET` | `/api/v1/districts/{district-id}/police-stations` | Returns all stations within this district. | Officer+ |

---

## 9. Tracking Devices

**Fields:** `device_id`, `device_serial_no`, `device_status`, `is_active`, `created_time`, `updated_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/tracking-devices` | Returns paginated list of devices. Supports `?vehicle-id=`, `?is_active=`, `?offset=`, `?limit=`. | Officer+ |
| `POST` | `/api/v1/tracking-devices` | Registers a new tracking device. | Admin |
| `GET` | `/api/v1/tracking-devices/{device-id}` | Returns a single device record with all fields above. | Officer+ |
| `PUT` | `/api/v1/tracking-devices/{device-id}` | Full replacement update of a device record. | Admin |
| `DELETE` | `/api/v1/tracking-devices/{device-id}` | Removes a device where `is_active = false`. | Admin |
| `GET` | `/api/v1/tracking-devices/{device-id}/status` | Composite — returns device record + most recent location ping. | Officer+ |
| `GET` | `/api/v1/tracking-devices/{device-id}/location-pings` | Returns all pings from this device. Supports `?from=`, `?to=`, `?offset=`, `?limit=`. | Officer+ |
| `POST` | `/api/v1/tracking-devices/{device-id}/toggle-active` | Toggles the `is_active` flag on a device. | Admin |

---

## 10. Location Pings

**Fields:** `ping_id`, `latitude`, `longitude`, `speed_kmh`, `device_battery`, `ping_timestamp`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/location-pings` | Device submits a new GPS ping. Authenticated by device token. | Device |
| `GET` | `/api/v1/location-pings/{ping-id}` | Returns a single ping record with all fields above. | Officer+ |

---

## 11. Controllers

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/assign-driver` | Atomically assigns a driver to a vehicle, closes any existing active assignment. Accepts `vehicle_id`, `driver_id`, `is_driver_owner`. | Officer+ |
| `POST` | `/api/v1/unassign-driver` | Closes the active driver assignment by setting `unassigned_time`. Accepts `vehicle_id`. | Officer+ |
| `POST` | `/api/v1/assign-vehicle-to-station` | Assigns a vehicle to a station jurisdiction. Accepts `vehicle_id`, `station_id`. | Officer+ |
| `POST` | `/api/v1/register-vehicle` | Atomically creates a vehicle, links it to a district, and links or creates an owner. Accepts full vehicle payload + `owner_id` + `district_id`. | Officer+ |

---

## Query Parameter Reference

| Parameter | Type | Applies To | Description |
|---|---|---|---|
| `?offset=` | Integer | All collections | Pagination start position (default: 0) |
| `?limit=` | Integer | All collections | Max records returned (default: 20, max: 100) |
| `?province-id=` | UUID | `/vehicles`, `/districts` | Filter by province |
| `?district-id=` | UUID | `/vehicles`, `/police-stations` | Filter by district |
| `?station-id=` | UUID | `/vehicles` | Filter by station |
| `?status=` | String | `/vehicles`, `/drivers` | Filter by `status_by_police` value |
| `?is_active=` | Boolean | `/tracking-devices` | Filter active or inactive devices |
| `?from=` | ISO 8601 | `/location-pings` | Start of time window |
| `?to=` | ISO 8601 | `/location-pings` | End of time window |
| `?role=` | String | `/users` | Filter users by role |
