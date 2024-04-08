# Admin Locations APIs

## URL

`https://services-parkncharge.sysnetph.com/admin_locations`

## APIs

### GET Locations - `GET /api/v1/locations?limit=10&offset=0`

### REGISTER Location - `POST /api/v1/locations`

Request Body

```json
{
	"name": "Petron: Charging Station",
	"address": "BGC, Taguig, Market-Market"
}
```

### GET Binded Locations by ID - `/api/v1/locations/:cpo_owner_id`

Parameter:

- cpo_owner_id: Number

### BIND/UNBIND Location - `PATCH /api/v1/locations/:action/:location_id/:cpo_owner_id`

Parameter:

- action: String
- location_id: Number
- cpo_owner_id: Number
