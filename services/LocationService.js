const LocationRepository = require("../repository/LocationRepository");

const axios = require("axios");
const { HttpBadRequest } = require("../utils/HttpError");

const logger = require("../config/winston");

module.exports = class LocationService {
	#repository;

	constructor() {
		this.#repository = new LocationRepository();
	}

	/**
	 * Retrieve all of locations.
	 *
	 * @param {Object} payload
	 * @param {payload.limit} limit Number of objects to returned.
	 * @param {payload.offset} offset Starting object
	 * @returns {Array}
	 */
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

	async RegisterLocation({
		cpo_owner_id,
		name,
		address,
		facilities,
		parking_types,
		parking_restrictions,
		images,
		admin_id,
	}) {
		try {
			// Request to Google Geocoding API for the data based on the address provided.
			const geocodedAddress = await axios.get(
				`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
					address
				)}&key=${process.env.GOOGLE_GEO_API_KEY}`
			);

			/**
			 * Get the address_components object
			 *
			 * This object contains all of the details related to a address such as municipality, region, and postal code.
			 */
			const address_components =
				geocodedAddress.data.results[0]?.address_components;

			// If location is not found.
			if (!address_components)
				throw new HttpBadRequest("LOCATION_NOT_FOUND", []);

			// Get the city name when the type is 'locality'
			const city = address_components.find((component) =>
				component.types.includes("locality")
			)?.long_name;

			/**
			 * Get the region name when the type is 'administrative_area_level_1'
			 *
			 * Get the first three letters of the region, convert it to uppercase, and trim it.
			 */
			const region = String(
				address_components.find((component) =>
					component.types.includes("administrative_area_level_1")
				)?.short_name
			)
				.slice(0, 3)
				.toUpperCase()
				.trim();

			/**
			 * Get the postal code of the address when the type is 'postal_code'
			 */
			const postal_code = address_components.find((component) =>
				component.types.includes("postal_code")
			)?.long_name;

			// Get the latitude, and longitude of the address
			const { lat, lng } = geocodedAddress.data.results[0].geometry.location;

			// Get the formatted address.
			const formatted_address =
				geocodedAddress.data.results[0].formatted_address;

			// Location Registration
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
					images: JSON.stringify(images),
				});

				const LOCATION_ID = result.insertId;

				// Add location's facilities
				const newFacilities = facilities.map((facility) => [
					facility,
					LOCATION_ID,
				]);

				await this.#repository.AddLocationFacilities(newFacilities);

				// Add location's parking types
				const newParkingTypes = parking_types.map((parkingType) => [
					parkingType.id,
					LOCATION_ID,
					parkingType.tag,
				]);

				await this.#repository.AddLocationParkingTypes(newParkingTypes);

				// Add location's parking restrictions
				const newParkingRestrictions = parking_restrictions.map(
					(parking_restriction) => [parking_restriction, LOCATION_ID]
				);

				const parkingRestrictionsResult =
					await this.#repository.AddLocationParkingRestrictions(
						newParkingRestrictions
					);

				if (parkingRestrictionsResult.affectedRows >= 1) {
					await this.#repository.AuditTrail({
						admin_id,
						cpo_id: null,
						action: "ADD new location",
						remarks: "success",
					});

					return "SUCCESS";
				}

				await this.#repository.AuditTrail({
					admin_id,
					cpo_id: null,
					action: "ATTEMPT to ADD new location",
					remarks: "failed",
				});

				return result;
			} catch (err) {
				throw err;
			}
		} catch (err) {
			await this.#repository.AuditTrail({
				admin_id,
				cpo_id: null,
				action: "ATTEMPT to ADD new location",
				remarks: "failed",
			});
			throw err;
		}
	}

	/**
	 * Retrieve all of the binded locations.
	 *
	 * @param {Number} cpoOwnerID Charging Point Operator's ID
	 * @returns {Array}
	 */
	async GetBindedLocations(cpoOwnerID) {
		const result = await this.#repository.GetBindedLocations(cpoOwnerID);

		return result;
	}

	/**
	 * Binds a location to CPO
	 *
	 * @param {Number} cpoOwnerID - Charging Point Operator's ID
	 * @param {Number} locationID - Location's ID
	 * @returns {Object}
	 */
	async BindLocation(cpoOwnerID, locationID, admin_id) {
		try {
			const result = await this.#repository.BindLocation(
				cpoOwnerID,
				locationID
			);

			const status = result[0][0].STATUS;

			if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

			await this.#repository.AuditTrail({
				admin_id,
				cpo_id: null,
				action: `BIND location to CPO with ID of ${cpoOwnerID}`,
				remarks: "success",
			});

			return status;
		} catch (err) {
			await this.#repository.AuditTrail({
				admin_id,
				cpo_id: null,
				action: `ATTEMPT to BIND location to CPO with ID of ${cpoOwnerID}`,
				remarks: "failed",
			});
			throw err;
		}
	}

	/**
	 * Unbinds a location from CPO
	 *
	 * @param {Number} cpoOwnerID - Charging Point Operator's ID
	 * @param {Number} locationID - Location's ID
	 * @returns {Object}
	 */
	async UnbindLocation(cpoOwnerID, locationID, admin_id) {
		try {
			const result = await this.#repository.UnbindLocation(
				cpoOwnerID,
				locationID
			);

			const status = result[0][0].STATUS;

			if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

			await this.#repository.AuditTrail({
				admin_id,
				cpo_id: null,
				action: `UNBIND location from CPO with ID of ${cpoOwnerID}`,
				remarks: "success",
			});

			return status;
		} catch (err) {
			await this.#repository.AuditTrail({
				admin_id,
				cpo_id: null,
				action: `ATTEMPT to UNBIND location from CPO with ID of ${cpoOwnerID}`,
				remarks: "failed",
			});
			throw err;
		}
	}

	/**
	 * Retrieve all of the default data from database
	 * for registration purposes.
	 *
	 * @returns {Object}
	 */
	async GetDefaultData() {
		const facilities = await this.#repository.GetDefaultFacilities();
		const parking_types = await this.#repository.GetDefaultParkingTypes();
		const parking_restrictions =
			await this.#repository.GetDefaultParkingRestrictions();

		return { facilities, parking_types, parking_restrictions };
	}

	async SearchLocationByName(name, limit, offset) {
		const result = await this.#repository.SearchLocationByName(
			name,
			limit,
			offset
		);

		return result;
	}
};
