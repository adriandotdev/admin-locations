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
};
