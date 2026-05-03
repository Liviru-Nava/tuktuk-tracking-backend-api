# tuktuk-tracking-backend-api
This repo is for my Web API Coursework related to Tuk-Tuk tracking (Three-wheel)
## Student Information
- **NIBM Student Index Number:** `COBSCCOMP242P-002`
- **Coventry Student ID:** `16114793`
---
## Project Overview
This project is a backend Web API developed as part of the NB6007CEM - Web API Development module.
The system is designed to support Sri Lanka Police and law enforcement agencies by providing a centralized platform for:
- Real-time tuk-tuk (three-wheeler) location tracking
- Vehicle visibility (last known location)
- Investigative logging (historical movement tracking)
- Administrative filtering (province and district level)
---
## Objectives
- Develop a secure, open-standard RESTful API
- Enable real-time and historical vehicle tracking
- Support law enforcement investigations
- Deploy a cloud-hosted backend system
---
## Key Features
- Vehicle management
- Driver and device management
- GPS location tracking
- Historical movement logs
- Role-based access control (Police HQ, Provincial, District)
---
## 🗂️ Data Model
<p align="center">
  <img src="Data%20and%20Resource%20Model/Data_Models.png" alt="Tuk-Tuk Tracking Data Model" width="800"/>
</p>
*Figure: Entity Relationship Diagram for Tuk-Tuk Tracking System*
---
### 📖 Data Model Summary
The system is structured around several core entities that interact to support tracking, monitoring, and investigation workflows.
#### 🔑 Key Entities
- **User**  
  Represents system users such as police officers. Includes authentication details and role-based access control.
- **Police Station**  
  Stores station-related data such as name, contact number, and geographic boundaries.
- **Vehicle**  
  Contains tuk-tuk registration details, ownership information, and police status.
- **Driver**  
  Holds driver identity details, license information, address, and legal status.
- **Tracking Device**  
  Represents GPS devices installed in vehicles, including device status and serial numbers.
- **Location Details**  
  Stores GPS tracking data such as latitude, longitude, timestamp, and battery health.
- **Province**  
  Represents administrative regions with defined boundaries.
- **District**  
  Represents subdivisions within provinces for more granular administrative control.
---
#### 🔗 Relationships
- A **User** is assigned to a **Police Station**  
- A **Vehicle** is registered within a **Province** and **District**  
- A **Vehicle** is owned by a **Driver**  
- A **Vehicle** has a **Tracking Device**  
- A **Tracking Device** generates multiple **Location Details (pings)** over time  
---
#### 🚀 Purpose of the Data Model
This structure enables:
- Real-time tracking of tuk-tuks  
- Historical movement analysis for investigations  
- Efficient region-based filtering (Province/District)  
- Centralized data management for law enforcement  

---
## 🔌 Resource Model
The Resource Model defines all RESTful API endpoints exposed by this system, including the HTTP method, endpoint path, a description of what each endpoint does, and the roles permitted to access it.

The full resource model is documented here: [📄 Resource Model](Data%20and%20Resource%20Model/Resource_Model.md)

### Overview
The API is structured around the following resource groups:

| Resource Group | Base Path | Description |
|---|---|---|
| Authentication | `/tuktrack/v1/auth` | Login, logout, and token refresh |
| Users | `/tuktrack/v1/users` | Police personnel account management |
| Owners | `/tuktrack/v1/owners` | Tuk-tuk owner records |
| Vehicles | `/tuktrack/v1/vehicles` | Vehicle registration and tracking |
| Drivers | `/tuktrack/v1/drivers` | Driver records and license management |
| Police Stations | `/tuktrack/v1/police-stations` | Station data and jurisdiction management |
| Provinces | `/tuktrack/v1/provinces` | Province reference data |
| Districts | `/tuktrack/v1/districts` | District reference data |
| Tracking Devices | `/tuktrack/v1/tracking-devices` | GPS device management |
| Location Pings | `/tuktrack/v1/location-pings` | GPS ping submission and retrieval |
| Controllers | `/tuktrack/v1/assign-*` | Atomic multi-entity operations |


### Sample Data
The sample data that was seeded into the database:
https://drive.google.com/file/d/1SmIpoVtVDz841tzAh-3OzTt1fYCYcmrG/view?usp=sharing
