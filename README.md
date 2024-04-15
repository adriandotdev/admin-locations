# Admin Locations APIs

## URL

`https://services-parkncharge.sysnetph.com/admin_locations`

## APIs

### GET Locations - `GET /api/v1/locations?limit=10&offset=0`

**Description**

Get all of the locations

**Parameters**

- **limit** - number of objects to return.
- **offset** - start to return.

**Sample Location Data**

```json
{
	"id": 1,
	"cpo_owner_id": 1,
	"name": "Rufino Building",
	"address": "6784 Ayala Ave, Legazpi Village, Makati, 1200 Metro Manila, Philippines",
	"address_lat": "14.55920000",
	"address_lng": "121.01750000",
	"city": "Makati",
	"region": "NCR",
	"postal_code": null,
	"location_image_id": "[\"https://stg-parkncharge.sysnetph.com/assets/img/sites/site2.jpg\", \"https://stg-parkncharge.sysnetph.com/assets/img/sites/site3.jpg\"]",
	"date_created": "2024-01-30T06:35:00.000Z",
	"date_modified": "2024-01-30T06:35:01.000Z"
}
```

---

### REGISTER Location - `POST /api/v1/locations`

**Description**

Registers location.

**Request**

```json
{
	"name": "Petron: Charging Station",
	"address": "BGC, Taguig, Market-Market"
}
```

**Response**

```json
{
	"status": 200,
	"data": "SUCCESS",
	"message": "Success"
}
```

---

### GET Binded Locations by ID - `/api/v1/locations/:cpo_owner_id`

**Description**

Get binded locations.

**Parameters**

- **cpo_owner_id**
  - Charging Point Operator's ID
  - Type: Number

**Sample Location Object**

```json
{
	"id": 1,
	"cpo_owner_id": 1,
	"name": "Rufino Building",
	"address": "6784 Ayala Ave, Legazpi Village, Makati, 1200 Metro Manila, Philippines",
	"address_lat": "14.55920000",
	"address_lng": "121.01750000",
	"city": "Makati",
	"region": "NCR",
	"postal_code": null,
	"location_image_id": "[\"https://stg-parkncharge.sysnetph.com/assets/img/sites/site2.jpg\", \"https://stg-parkncharge.sysnetph.com/assets/img/sites/site3.jpg\"]",
	"date_created": "2024-01-30T06:35:00.000Z",
	"date_modified": "2024-01-30T06:35:01.000Z"
}
```

---

### BIND/UNBIND Location - `PATCH /api/v1/locations/:action/:location_id/:cpo_owner_id`

**Description**

Bind or Unbind a location to Charging Point Operator.

**Parameters**

- **action**
  - It's either 'bind' or 'unbind'
  - Type: String
- **location_id**
  - Location's ID to be binded
  - Type: Number
- **cpo_owner_id**
  - Charging Point Operator's ID
  - Type: Number

**Response**

```json
{
	"status": 200,
	"data": "SUCCESS",
	"message": "Success"
}
```

**Errors**

- **INVALID_ACTIONS: Valid actions are bind, and unbind only**
- **LOCATION_ID_DOES_NOT_EXISTS**
- **CPO_OWNER_ID_DOES_NOT_EXISTS**
- **LOCATION_IS_ALREADY_BINDED**
