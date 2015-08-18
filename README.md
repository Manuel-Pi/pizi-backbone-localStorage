# pizi-backbone-localStorage

Wrapper to deal with the localStorage API for backbone entities

## functions

### apply(options)

**options [Object]** The option object:

	{
		success: function(){...}, // Success callback
		error: function(){...}, // Error callback
		session: "false" // True if a session object must be created
	} 

Overriding Backbone.sync() using the localStorage API. A session object (Backbone.Model), can be created.

### disable()

Restore the default Backbone.sync() implementation.

### initSession(options)

**options [Object]** The option object:

	{
		success: function(){...}, // Success callback
		error: function(){...}, // Error callback
	  	persist: "indexedDB", // Set the persistence API for models and session, localStorage or indexedDB
	  	models: "localStorage", // Set the persistence API, only for models, if not defined, egal 'persist'
	  	dbName: "name", // Name of the IDBDatabase, if indexedDB used
		dbVersion: "1" // Version of the database, if indexedDB used
	} 

### saveEntity(model, options)

### deleteEntity(model, options)

### getEntity(model, options)

### getAllEntity(model, options)
