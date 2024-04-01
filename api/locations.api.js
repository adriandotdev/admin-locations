const { AccessTokenVerifier } = require("../middlewares/TokenMiddleware"); // Remove this if unused
const { validationResult, body } = require("express-validator");

const logger = require("../config/winston");

const LocationService = require("../services/LocationService");

/**
 * @param {import('express').Express} app
 */
module.exports = (app) => {
	const service = new LocationService();

	/**
	 * This function will be used by the express-validator for input validation,
	 * and to be attached to APIs middleware.
	 * @param {*} req
	 * @param {*} res
	 */
	function validate(req, res) {
		const ERRORS = validationResult(req);

		if (!ERRORS.isEmpty()) {
			throw new HttpUnprocessableEntity(
				"Unprocessable Entity",
				ERRORS.mapped()
			);
		}
	}

	app.get(
		"/admin_locations/api/v1/locations",
		[AccessTokenVerifier],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				logger.info({
					GET_LOCATIONS_REQUEST: {},
				});

				const result = await service.GetLocations();

				logger.info({
					GET_LOCATIONS_RESPONSE: {
						message: "SUCCESS",
					},
				});
				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({
					GET_LOCATIONS_ERROR: {
						err,
						message: err.message,
					},
				});
				return res.status(err.status || 500).json({
					status: err.status || 500,
					data: err.data || [],
					message: err.message || "Internal Server Error",
				});
			}
		}
	);
};
