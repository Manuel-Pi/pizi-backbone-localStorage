# pizi-backbone-localStorage

Wrapper to deal with the localStorage API for backbone entities, overriding Backbone.sync() function.
Entities must have a className

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
	  	persist: 
	}
	
Create a Session object (Backbone.Model), accessible from Backbone.session.

### saveEntity(model, options)

### deleteEntity(model, options)

### getEntity(model, options)

### getAllEntity(model, options)
