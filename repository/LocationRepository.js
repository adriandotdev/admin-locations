const mysql = require("../database/mysql");

module.exports = class LocationRepository {
	GetLocations({ limit, offset }) {
		const QUERY = `
			SELECT 
				* 
			FROM 
				cpo_locations 
			LIMIT ? OFFSET ?
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [limit, offset], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetUnbindedLocations() {
		const QUERY = `
			SELECT 
				* 
			FROM 
				cpo_locations 
			WHERE cpo_owner_id IS NULL`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	RegisterLocation({
		cpo_owner_id,
		name,
		address,
		lat,
		lng,
		city,
		region,
		postal_code,
		images,
	}) {
		const QUERY = `
			INSERT INTO 
				cpo_locations 
					(cpo_owner_id, name, address, address_lat, address_lng, city, region, postal_code, images, date_created, date_modified)
			VALUES 
					(?,?,?,?,?,?,?,?,?, NOW(), NOW());
		`;

		return new Promise((resolve, reject) => {
			mysql.query(
				QUERY,
				[
					cpo_owner_id,
					name,
					address,
					lat,
					lng,
					city,
					region,
					postal_code,
					images,
				],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	GetBindedLocations(cpoOwnerID) {
		const QUERY = `
			SELECT 
				* 
			FROM 
				cpo_locations 
			WHERE 
				cpo_owner_id =  ?
				OR cpo_owner_id IS NULL
			ORDER BY cpo_owner_id IS NULL
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [cpoOwnerID], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	BindLocation(cpoOwnerID, locationID) {
		const QUERY = `CALL WEB_ADMIN_BIND_LOCATION(?,?)`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [cpoOwnerID, locationID], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	UnbindLocation(cpoOwnerID, locationID) {
		const QUERY = `CALL WEB_ADMIN_UNBIND_LOCATION(?,?)`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [cpoOwnerID, locationID], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetDefaultFacilities() {
		const QUERY = `SELECT * FROM facilities`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	AddLocationFacilities(facilities) {
		const QUERY = `
			INSERT INTO 
				cpo_location_facilities 
				(facility_id, cpo_location_id)
			VALUES ?
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [facilities], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetDefaultParkingTypes() {
		const QUERY = `
			SELECT 
				* 
			FROM 
				parking_types
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	AddLocationParkingTypes(parkingTypes) {
		const QUERY = `
			INSERT INTO 
				cpo_location_parking_types (parking_type_id, cpo_location_id, tag)
			VALUES ?
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [parkingTypes], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetDefaultParkingRestrictions() {
		const QUERY = `
			SELECT 
				* 
			FROM 
				parking_restrictions`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, (err, result) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			});
		});
	}

	AddLocationParkingRestrictions(parkingRestrictions) {
		const QUERY = `
			INSERT INTO 
				cpo_location_parking_restrictions (parking_restriction_code_id, cpo_location_id)
			VALUES ?
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [parkingRestrictions], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	SearchLocationByName(name, limit, offset) {
		const QUERY = `
			SELECT 
				* 
			FROM 
				cpo_locations 
			WHERE 
				LOWER(name) LIKE ?
			LIMIT ${limit} OFFSET ${offset}
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [`%${name}%`], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
