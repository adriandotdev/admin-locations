const LocationRepository = require("../repository/LocationRepository");

module.exports = class LocationService {
	#repository;

	constructor() {
		this.#repository = new LocationRepository();
	}

	async GetLocations() {
		const result = await this.#repository.GetLocations();

		return result;
	}
};
