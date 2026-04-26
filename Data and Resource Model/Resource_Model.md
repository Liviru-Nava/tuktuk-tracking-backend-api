# API Resource Model — Tuk-Tuk Tracking System

**Base Path:** `/api/v1`  
**Auth Scheme:** JWT Bearer Token

---

## Role Definitions

| Role Key | Description |
|---|---|
| `Public` | Unauthenticated access. No access beyond the login endpoint. |
| `Device` | Authenticated tracking device. Can only submit location pings. |
| `HQ_SUPER_ADMIN` | Police HQ super administrator. Full system access, national jurisdiction. |
| `HQ_OFFICER` | Police HQ officer. National jurisdiction, limited to assigned permissions. |
| `PROVINCIAL_HEAD` | Provincial-level head. Can manage users within their province. |
| `PROVINCIAL_OFFICER` | Provincial-level officer. Scoped to their assigned province. |
| `DISTRICT_HEAD` | District-level head. Can manage users within their district. |
| `DISTRICT_OFFICER` | District-level officer. Scoped to their assigned district. |
| `STATION_HEAD` | Station-level head. Can manage users within their station. |
| `STATION_OFFICER` | Station-level officer. Scoped to their assigned station. |

> Access in the endpoint tables is expressed as a **permission string** (e.g. `vehicle:view`) rather than a role name. Every request is evaluated against two checks — (1) does the user's role carry the required permission, and (2) does the requested data fall within the user's office jurisdiction. Both must pass.

> `Authenticated` means any valid JWT regardless of role.

---

## 1. Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticates user, returns JWT access token and refresh token. | Public |
| `POST` | `/api/v1/auth/logout` | Invalidates the current JWT token. | Authenticated |
| `POST` | `/api/v1/auth/refresh` | Issues a new access token using a valid refresh token. | Authenticated |

---

## 2. Provinces

> Read-only. Seeded once via migration script. Provinces are constitutionally defined — the Police Department has no authority to create or modify them. No POST, PUT, or DELETE endpoints exist.

**Fields:** `province_id`, `province_name`, `province_code`, `created_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/provinces` | Returns all 9 provinces. | Authenticated |
| `GET` | `/api/v1/provinces/{province-id}` | Returns a single province record with all fields above. | Authenticated |
| `GET` | `/api/v1/provinces/{province-id}/districts` | Returns all districts belonging to this province. | `district:view` |

---

## 3. Districts

> Read-only. Seeded once via migration script. Districts are administratively defined — the Police Department has no authority to create or modify them. No POST, PUT, or DELETE endpoints exist.

**Fields:** `district_id`, `province_id`, `district_name`, `district_code`, `created_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/districts` | Returns all 25 districts. Supports `?province-id=`, `?offset=`, `?limit=`. | Authenticated |
| `GET` | `/api/v1/districts/{district-id}` | Returns a single district record with all fields above. | Authenticated |
| `GET` | `/api/v1/districts/{district-id}/offices` | Returns all offices within this district. | `office:view` |

---

## 4. Offices

**Fields:** `office_id`, `office_code`, `office_name`, `office_type`, `jurisdiction_type`, `jurisdiction_ref_id`, `office_address`, `office_contact`, `status`, `created_time`, `updated_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/offices` | Returns offices within caller's jurisdiction. Supports `?jurisdiction-type=`, `?office-type=`, `?district-id=`, `?province-id=`, `?offset=`, `?limit=`. | `office:view` |
| `POST` | `/api/v1/offices` | Creates a new office. | `office:create` |
| `GET` | `/api/v1/offices/{office-id}` | Returns a single office record with all fields above. | `office:view` |
| `PUT` | `/api/v1/offices/{office-id}` | Full replacement update of an office record. | `office:edit` |
| `DELETE` | `/api/v1/offices/{office-id}` | Transitions office `status` to `CLOSED`. | `office:delete` |
| `GET` | `/api/v1/offices/{office-id}/users` | Returns all users belonging to this office. | `user:view` |

---

## 5. Roles

> `GET` is open to all authenticated users. `PUT` is restricted to `HQ_SUPER_ADMIN` only and updates `permissions` array and `role_description` only. `role_name` and `user_management_scope` are not editable via API. No POST or DELETE — role creation and removal is a deployment-time concern.

**Fields:** `role_id`, `role_name`, `role_description`, `user_management_scope`, `permissions`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/roles` | Returns all roles with their permission arrays and management scope. | Authenticated |
| `GET` | `/api/v1/roles/{role-id}` | Returns a single role record with full permission list. | Authenticated |
| `PUT` | `/api/v1/roles/{role-id}` | Updates `permissions` array and `role_description` only. | `HQ_SUPER_ADMIN` |

---

## 6. Users

**Fields:** `user_id`, `username`, `fullname`, `email_address`, `contact_no`, `badge_id`, `office_id`, `role_id`, `status`, `last_login_time`, `created_time`, `updated_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/users` | Returns paginated list of users within caller's jurisdiction. Supports `?office-id=`, `?role-id=`, `?status=`, `?offset=`, `?limit=`. | `user:view` |
| `POST` | `/api/v1/users` | Creates a new user account within caller's management scope. | `user:create` |
| `GET` | `/api/v1/users/{user-id}` | Returns a single user record with all fields above. | `user:view` / Self |
| `PUT` | `/api/v1/users/{user-id}` | Full replacement update of a user record. | `user:edit` |
| `DELETE` | `/api/v1/users/{user-id}` | Transitions user `status` to `INACTIVE`. | `user:deactivate` |
| `POST` | `/api/v1/users/{user-id}/deactivate` | Transitions user `status` to `INACTIVE` without a full PUT payload. | `user:deactivate` |

---

## 7. Owners

**Fields:** `owner_id`, `owner_fullname`, `owner_identity_no`, `owner_id_type`, `owner_gender`, `owner_contact`, `owner_address`, `status`, `created_time`, `updated_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/owners` | Returns paginated list of all owners. Supports `?status=`, `?offset=`, `?limit=`. | `owner:view` |
| `POST` | `/api/v1/owners` | Registers a new vehicle owner. | `owner:create` |
| `GET` | `/api/v1/owners/{owner-id}` | Returns a single owner record with all fields above. | `owner:view` |
| `PUT` | `/api/v1/owners/{owner-id}` | Full replacement update of an owner record. | `owner:edit` |
| `DELETE` | `/api/v1/owners/{owner-id}` | Transitions owner `status` to `INACTIVE`. | `owner:delete` |
| `GET` | `/api/v1/owners/{owner-id}/vehicles` | Returns all vehicles registered under this owner. | `owner:view`, `vehicle:view` |

---

## 8. Vehicles

**Fields:** `vehicle_id`, `owner_id`, `district_id`, `device_id`, `license_plate_no`, `vehicle_reg_no`, `chassis_number`, `engine_number`, `make_of_vehicle`, `model_of_vehicle`, `manufacture_year`, `vehicle_colour`, `fuel_type`, `is_diplomatic`, `vehicle_reg_date`, `status`, `created_time`, `updated_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/vehicles` | Returns paginated list of vehicles filtered by caller's jurisdiction. Supports `?province-id=`, `?district-id=`, `?status=`, `?reg-no=`, `?owner-id=`, `?offset=`, `?limit=`. | `vehicle:view` |
| `POST` | `/api/v1/vehicles` | Registers a new vehicle. | `vehicle:create` |
| `GET` | `/api/v1/vehicles/{vehicle-id}` | Returns a single vehicle record with all fields above. | `vehicle:view` |
| `PUT` | `/api/v1/vehicles/{vehicle-id}` | Full replacement update of a vehicle record. | `vehicle:edit` |
| `DELETE` | `/api/v1/vehicles/{vehicle-id}` | Transitions vehicle `status` to `DEREGISTERED`. | `vehicle:delete` |
| `GET` | `/api/v1/vehicles/{vehicle-id}/profile` | Composite — returns vehicle + owner + current driver + active device details. | `vehicle:view` |
| `GET` | `/api/v1/vehicles/{vehicle-id}/drivers` | Returns full driver assignment history for this vehicle. | `assignment:view` |
| `GET` | `/api/v1/vehicles/{vehicle-id}/assignments/{assignment-id}` | Returns a single assignment record with `assignment_id`, `assigned_time`, `unassigned_time`, `is_driver_owner`, `is_current_driver`. | `assignment:view` |
| `GET` | `/api/v1/vehicles/{vehicle-id}/location-pings` | Returns GPS location history. Supports `?from=`, `?to=` (ISO 8601), `?offset=`, `?limit=`. | `location:view_history` |
| `GET` | `/api/v1/vehicles/{vehicle-id}/last-location` | Returns the single most recent GPS ping for this vehicle via linked `device_id`. | `location:view_live` |
| `POST` | `/api/v1/vehicles/{vehicle-id}/change-status` | Updates `status` field only — `ACTIVE`, `SUSPENDED`, `FLAGGED`. | `vehicle:change_status` |

---

## 9. Drivers

**Fields:** `driver_id`, `driver_fullname`, `driver_identity_no`, `driver_id_type`, `date_of_birth`, `driver_gender`, `driver_contact_no`, `address`, `driver_license_no`, `license_expiry_date`, `status`, `created_time`, `updated_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/drivers` | Returns paginated list of drivers. Supports `?status=`, `?offset=`, `?limit=`. | `driver:view` |
| `POST` | `/api/v1/drivers` | Registers a new driver. | `driver:create` |
| `GET` | `/api/v1/drivers/{driver-id}` | Returns a single driver record with all fields above. | `driver:view` |
| `PUT` | `/api/v1/drivers/{driver-id}` | Full replacement update of a driver record. | `driver:edit` |
| `DELETE` | `/api/v1/drivers/{driver-id}` | Transitions driver `status` to `SUSPENDED`. | `driver:delete` |
| `POST` | `/api/v1/drivers/{driver-id}/change-status` | Updates `status` field only — `ACTIVE`, `SUSPENDED`, `BLACKLISTED`. | `driver:change_status` |

---

## 10. Tracking Devices

**Fields:** `device_id`, `device_serial_no`, `device_status`, `created_time`, `updated_time`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/tracking-devices` | Returns paginated list of devices. Supports `?vehicle-id=`, `?device-status=`, `?offset=`, `?limit=`. | `device:view` |
| `POST` | `/api/v1/tracking-devices` | Registers a new tracking device. | `device:create` |
| `GET` | `/api/v1/tracking-devices/{device-id}` | Returns a single device record with all fields above. | `device:view` |
| `PUT` | `/api/v1/tracking-devices/{device-id}` | Full replacement update of a device record. | `device:edit` |
| `DELETE` | `/api/v1/tracking-devices/{device-id}` | Transitions device `device_status` to `DECOMMISSIONED`. | `device:delete` |
| `GET` | `/api/v1/tracking-devices/{device-id}/status` | Composite — returns device record + most recent location ping. | `device:view`, `location:view_live` |
| `GET` | `/api/v1/tracking-devices/{device-id}/location-pings` | Returns all pings from this device. Supports `?from=`, `?to=`, `?offset=`, `?limit=`. | `location:view_history` |
| `POST` | `/api/v1/tracking-devices/{device-id}/change-status` | Updates `device_status` field only — `ACTIVE`, `INACTIVE`, `FAULTY`, `DECOMMISSIONED`. | `device:edit` |

---

## 11. Location Pings

> Append-only. No UPDATE or DELETE endpoints. `ping_timestamp` is the authoritative time record.

**Fields:** `ping_id`, `device_id`, `latitude`, `longitude`, `speed_kmh`, `device_battery`, `ping_timestamp`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/location-pings` | Device submits a new GPS ping. Authenticated by device token. | Device Token |
| `GET` | `/api/v1/location-pings/{ping-id}` | Returns a single ping record with all fields above. | `location:view_history` |

---

## 12. Controllers

> Atomic multi-entity operations. POST only. Named as verbs per WSO2 section 5.1. No controller may be split across separate calls without risking data inconsistency.

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/assign-driver` | Atomically closes previous active assignment and opens new one. Accepts `vehicle_id`, `driver_id`, `is_driver_owner`. | `assignment:create` |
| `POST` | `/api/v1/unassign-driver` | Closes active assignment by setting `unassigned_time` and `is_current_driver = false`. Accepts `vehicle_id`. | `assignment:close` |
| `POST` | `/api/v1/assign-device` | Links a tracking device to a vehicle by updating `device_id` on the vehicle record. Accepts `vehicle_id`, `device_id`. | `device:assign_to_vehicle` |

---

## Summary Count

| # | Resource Group | GET | POST | PUT | DELETE | Total |
|---|---|---|---|---|---|---|
| 1 | Authentication | 0 | 3 | 0 | 0 | **3** |
| 2 | Provinces | 3 | 0 | 0 | 0 | **3** |
| 3 | Districts | 3 | 0 | 0 | 0 | **3** |
| 4 | Offices | 3 | 1 | 1 | 1 | **6** |
| 5 | Roles | 2 | 0 | 1 | 0 | **3** |
| 6 | Users | 2 | 2 | 1 | 1 | **6** |
| 7 | Owners | 3 | 1 | 1 | 1 | **6** |
| 8 | Vehicles | 7 | 2 | 1 | 1 | **11** |
| 9 | Drivers | 2 | 2 | 1 | 1 | **6** |
| 10 | Tracking Devices | 4 | 2 | 1 | 1 | **8** |
| 11 | Location Pings | 1 | 1 | 0 | 0 | **2** |
| 12 | Controllers | 0 | 3 | 0 | 0 | **3** |
| | **Total** | **30** | **17** | **7** | **6** | **60** |

---

## Query Parameter Reference

| Parameter | Type | Applies To | Description |
|---|---|---|---|
| `?offset=` | Integer | All collections | Pagination start position (default: 0) |
| `?limit=` | Integer | All collections | Max records returned (default: 20, max: 100) |
| `?province-id=` | UUID | `/vehicles`, `/districts`, `/offices` | Filter by province |
| `?district-id=` | UUID | `/vehicles`, `/offices` | Filter by district |
| `?office-id=` | UUID | `/users` | Filter users by office |
| `?role-id=` | UUID | `/users` | Filter users by role |
| `?owner-id=` | UUID | `/vehicles` | Filter vehicles by owner |
| `?reg-no=` | String | `/vehicles` | Partial or exact plate number search |
| `?status=` | String | `/vehicles`, `/drivers`, `/owners`, `/users` | Filter by `status` value |
| `?device-status=` | String | `/tracking-devices` | Filter by `device_status` value |
| `?office-type=` | String | `/offices` | Filter by `office_type` value |
| `?jurisdiction-type=` | String | `/offices` | Filter by `jurisdiction_type` value |
| `?from=` | ISO 8601 | `/location-pings` | Start of time window |
| `?to=` | ISO 8601 | `/location-pings` | End of time window |
