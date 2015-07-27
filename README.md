# pizi-backbone-localStorage

Wrapper to deal with the localStorage API for backbone entities

## functions

### apply(options)

**options [Object]** The option object:

	{
		success: function(){...}, // Success callback
		error: function(){...}, // Error callback
	  	persist: "indexedDB", // Set the persistence API for models and session, localStorage or indexedDB
	  	models: "localStorage", // Set the persistence API, only for models, if not defined, egal 'persist'
	  	dbName: "name", // Name of the IDBDatabase, if indexedDB used
		dbVersion: "1" // Version of the database, if indexedDB used
	} 

Initialize the sepecified persit API overriding Backbone.sync(). A different API can be used for models and session object.
