const LocationRepository = require("../repository/LocationRepository");

const axios = require("axios");
const { HttpBadRequest } = require("../utils/HttpError");

const logger = require("../config/winston");

module.exports = class LocationService {
	#repository;

	constructor() {
		this.#repository = new LocationRepository();
	}

	async GetLocations({ limit, offset }) {
		if (typeof limit !== "number")
			throw new HttpBadRequest(
				"Invalid limit. Limit must be in type of number"
			);

		if (typeof offset !== "number")
			throw new HttpBadRequest(
				"Invalid offset. Limit must be in type of number"
			);

		const result = await this.#repository.GetLocations({ limit, offset });

		return result;
	}

	async GetUnbindedLocations() {
		const result = await this.#repository.GetUnbindedLocations();

		return result;
	}

	async RegisterLocation({ cpo_owner_id, name, address }) {
		const geocodedAddress = await axios.get(
			`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
				address
			)}&key=${process.env.GOOGLE_GEO_API_KEY}`
		);

		const address_components =
			geocodedAddress.data.results[0]?.address_components;

		if (!address_components) throw new HttpBadRequest("LOCATION_NOT_FOUND", []);

		const city = address_components.find((component) =>
			component.types.includes("locality")
		)?.long_name;

		const region = String(
			address_components.find((component) =>
				component.types.includes("administrative_area_level_1")
			)?.short_name
		)
			.slice(0, 3)
			.toUpperCase()
			.trim();

		const postal_code = address_components.find((component) =>
			component.types.includes("postal_code")
		)?.long_name;

		const { lat, lng } = geocodedAddress.data.results[0].geometry.location;

		const formatted_address = geocodedAddress.data.results[0].formatted_address;
		/**
		 * @TODO
		 * Fix this logic to get the postal code based on the address provided.
		 * Must retrieve the administrative_level_5
		 */
		// const placeID = await axios.get(
		// 	`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${"14.238077"}%2C${"121.1569948"}&radius=2000&type=post_office&key=${
		// 		process.env.GOOGLE_GEO_API_KEY
		// 	}`
		// );

		// const postal = await axios.get(
		// 	`https://maps.googleapis.com/maps/api/geocode/json?place_id=${"ChIJ9bBUdhRivTMRBYrSM2j6qvo"}&key=${
		// 		process.env.GOOGLE_GEO_API_KEY
		// 	}`
		// );

		logger.info({
			GEOCODE_ADDRESS_DATA: {
				data: geocodedAddress.data,
			},
		});

		try {
			const result = await this.#repository.RegisterLocation({
				cpo_owner_id: cpo_owner_id || null,
				name,
				address: formatted_address,
				lat,
				lng,
				city,
				region,
				postal_code: postal_code || null,
			});

			if (result.affectedRows >= 1) return "SUCCESS";

			return result;
		} catch (err) {
			if (
				err.message.includes(
					"Cannot add or update a child row: a foreign key constraint fails"
				)
			)
				throw new HttpBadRequest("CPO_OWNER_ID_DOES_NOT_EXISTS");
		}
	}

	async GetBindedLocations(cpoOwnerID) {
		const result = await this.#repository.GetBindedLocations(cpoOwnerID);

		return result;
	}

	async BindLocation(cpoOwnerID, locationID) {
		const result = await this.#repository.BindLocation(cpoOwnerID, locationID);

		const status = result[0][0].STATUS;

		if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

		return status;
	}

	async UnbindLocation(cpoOwnerID, locationID) {
		const result = await this.#repository.UnbindLocation(
			cpoOwnerID,
			locationID
		);

		const status = result[0][0].STATUS;

		if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

		return status;
	}
};
