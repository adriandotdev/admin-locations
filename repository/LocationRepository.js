const mysql = require("../database/mysql");

module.exports = class LocationRepository {
	GetLocations() {
		const QUERY = `SELECT * FROM cpo_locations`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetUnbindedLocations() {
		const QUERY = `SELECT * FROM cpo_locations WHERE cpo_owner_id IS NULL`;

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
	}) {
		const QUERY = `
			INSERT INTO cpo_locations (cpo_owner_id, name, address, address_lat, address_lng, city, region, postal_code, date_created, date_modified)
			VALUES (?,?,?,?,?,?,?,?, NOW(), NOW());
		`;

		return new Promise((resolve, reject) => {
			mysql.query(
				QUERY,
				[cpo_owner_id, name, address, lat, lng, city, region, postal_code],
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
			SELECT * FROM cpo_locations 
			WHERE cpo_owner_id =  ?
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
};
