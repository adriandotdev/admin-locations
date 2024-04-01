const { AccessTokenVerifier } = require("../middlewares/TokenMiddleware"); // Remove this if unused
const { validationResult, body } = require("express-validator");

const logger = require("../config/winston");

const LocationService = require("../services/LocationService");
const {
	HttpUnauthorized,
	HttpUnprocessableEntity,
} = require("../utils/HttpError");

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
					GET_LOCATIONS_REQUEST: {
						role: req.role,
					},
				});

				if (req.role !== "ADMIN")
					throw new HttpUnauthorized("Unauthorized", []);

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

	app.get(
		"/admin_locations/api/v1/locations/unbinded",
		[AccessTokenVerifier],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				logger.info({ GET_UNBINDED_LOCATIONS_REQUEST: { role: req.role } });

				if (req.role !== "ADMIN")
					throw new HttpUnauthorized("Unauthorized", []);

				const result = await service.GetUnbindedLocations();

				logger.info({
					GET_UNBINDED_LOCATIONS_RESPONSE: {
						message: "SUCCESS",
					},
				});

				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({
					GET_UNBINDED_LOCATIONS_ERROR: {
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

	app.post(
		"/admin_locations/api/v1/locations",
		[
			AccessTokenVerifier,
			body("name")
				.notEmpty()
				.withMessage("Missing required property: name")
				.escape()
				.trim(),
			body("address")
				.notEmpty()
				.withMessage("Missing required property: address")
				.escape()
				.trim(),
		],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				logger.info({
					REGISTER_LOCATION_REQUEST: {
						role: req.role,
						data: {
							...req.body,
						},
					},
				});

				if (req.role !== "ADMIN")
					throw new HttpUnauthorized("Unauthorized", []);

				validate(req, res);

				const { cpo_owner_id, name, address } = req.body;

				const result = await service.RegisterLocation({
					cpo_owner_id,
					name,
					address,
				});

				logger.info({
					REGISTER_LOCATION_RESPONSE: {
						message: "SUCCESS",
					},
				});

				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({
					REGISTER_LOCATION_ERROR: {
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
