const TokenMiddleware = require("../middlewares/TokenMiddleware"); // Remove this if unused
const {
	ROLES,
	RoleManagementMiddleware,
} = require("../middlewares/RoleManagementMiddleware");

const { validationResult, body } = require("express-validator");

const logger = require("../config/winston");

const LocationService = require("../services/LocationService");
const {
	HttpUnprocessableEntity,
	HttpBadRequest,
} = require("../utils/HttpError");

/**
 * @param {import('express').Express} app
 */
module.exports = (app) => {
	const service = new LocationService();
	const tokenMiddleware = new TokenMiddleware();
	const roleMiddleware = new RoleManagementMiddleware();
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
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(
				ROLES.ADMIN,
				ROLES.ADMIN_MARKETING,
				ROLES.ADMIN_NOC
			),
		],

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

				const { limit, offset } = req.query;

				const result = await service.GetLocations({
					limit: parseInt(limit, 10) || 10,
					offset: parseInt(offset, 10) || 0,
				});

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
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(
				ROLES.ADMIN,
				ROLES.ADMIN_MARKETING,
				ROLES.ADMIN_NOC
			),
		],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				logger.info({ GET_UNBINDED_LOCATIONS_REQUEST: { role: req.role } });

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
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(
				ROLES.ADMIN,
				ROLES.ADMIN_MARKETING,
				ROLES.ADMIN_NOC
			),
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
			body("facilities")
				.isArray()
				.withMessage("Property: facilities must be in type of array"),
			body("parking_types")
				.isArray()
				.withMessage("Property: parking_types must be in type of array"),
			body("parking_types.*.id")
				.notEmpty()
				.withMessage("Missing required parking type property: id"),
			body("parking_types.*.tag")
				.notEmpty()
				.withMessage("Missing required parking type property: tag"),
			body("parking_restrictions")
				.isArray()
				.withMessage("Property: parking_restrictions must be in type of array"),
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

				validate(req, res);

				const {
					cpo_owner_id,
					name,
					address,
					facilities,
					parking_types,
					parking_restrictions,
				} = req.body;

				const result = await service.RegisterLocation({
					cpo_owner_id,
					name,
					address,
					facilities,
					parking_types,
					parking_restrictions,
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

	app.get(
		"/admin_locations/api/v1/locations/:cpo_owner_id",
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(
				ROLES.ADMIN,
				ROLES.ADMIN_MARKETING,
				ROLES.ADMIN_NOC
			),
		],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				logger.info({
					GET_LOCATIONS_BINDED_TO_CPO_REQUEST: {
						role: req.role,
						cpo_owner_id: req.params.cpo_owner_id,
					},
				});

				const { cpo_owner_id } = req.params;

				const result = await service.GetBindedLocations(cpo_owner_id);

				logger.info({
					GET_LOCATIONS_BINDED_TO_CPO_RESPONSE: {
						message: "SUCCESS",
					},
				});

				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({
					GET_LOCATIONS_BINDED_TO_CPO: {
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

	app.patch(
		"/admin_locations/api/v1/locations/:action/:location_id/:cpo_owner_id",
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(
				ROLES.ADMIN,
				ROLES.ADMIN_MARKETING,
				ROLES.ADMIN_NOC
			),
		],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				logger.info({
					BIND_LOCATION_TO_CPO_REQUEST: {
						role: req.role,
						location_id: req.params.location_id,
						cpo_owner_id: req.params.cpo_owner_id,
					},
				});

				const VALID_ACTIONS = ["bind", "unbind"];

				const { action, location_id, cpo_owner_id } = req.params;

				if (!VALID_ACTIONS.includes(action))
					throw new HttpBadRequest(
						"INVALID_ACTIONS: Valid actions are bind, and unbind only"
					);

				let result = undefined;

				if (action === "bind")
					result = await service.BindLocation(cpo_owner_id, location_id);
				else result = await service.UnbindLocation(cpo_owner_id, location_id);

				logger.info({
					BIND_LOCATION_TO_CPO_RESPONSE: {
						message: "SUCCESS",
					},
				});

				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({
					BIND_LOCATION_TO_CPO_ERROR: {
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
		"/admin_locations/api/v1/locations/data/defaults",
		[tokenMiddleware.BasicTokenVerifier()],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				logger.info({
					GET_DEFAULT_FACILITIES_REQUEST: {
						message: "SUCCESS",
					},
				});

				const result = await service.GetDefaultData();

				logger.info({
					GET_DEFAULT_FACILITIES_RESPONSE: {
						message: "SUCCESS",
					},
				});

				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({
					GET_DEFAULT_FACILITIES_ERROR: {
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
