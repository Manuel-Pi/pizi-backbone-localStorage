import Backbone from "backbone";
import piziLocalStorage from "pizi-localStorage";

var idsExtension = '-map';

var ids = {};

function getAllEntity(model, options = {}){
	var entities = piziLocalStorage.get(model.className ||  model.model && model.model.prototype.className) || {};
	_.each(entities, (data) => {
		var dates = model.model && model.model.prototype.dates ? model.model.prototype.dates : model.dates;
		dates = _.pick(data, ['date'].concat(dates));
		for(var date in dates){
			if(dates.hasOwnProperty(date) && dates[date]){
				data[date] = new Date(dates[date]);
			}
		}
	});
	if(options.success){
		options.success(entities);
	}
	return entities;
}

function saveEntity(model, options = {}){
	if(model instanceof Backbone.Model){
		var entities = getAllEntity(model);

		var data = model.toJSON(options);

		var dates = _.pick(data, ['date'].concat(model.dates));
		for(var date in dates){
			if(dates.hasOwnProperty(date)){
				if(dates[date] instanceof Date){
					// Deal Dates
					data[date] = dates[date].getTime();
				}
			}
		}

		var id = 0;
		// No id defined
		if(!model.id){
			// Check in the stored ids if one is defined for this class
			if(!ids[model.className]){
				for(var entity in entities){
					if(!isNaN(entity.id) && entity.id > id){
						id = entity.id;
					}
				}
				ids[model.className] = id;
			}
			// Increment to have the new key
			ids[model.className] = ids[model.className]++;
			entities[ids[model.className]] = data;
			piziLocalStorage.save(model.className, entities);
			// Returning the index to let Backbone set it (not sure !)
			data = {};
			data[model.idAttribute] = ids[model.className];
			if(options.success){
				options.success(data);
			}
			return data;
		} else {
			entities[model.id] = data;
			piziLocalStorage.save(model.className, entities);
			if(options.success){
				options.success();
			}
		}
	} else if(options.error){
		options.error(new Error('Not Backbone model!'));
	}
}

function getEntity(model, options = {}){
	if(model.id || model.id === 0){
		var entities = getAllEntity(model);
		if(options.success){
			options.success(entities[model.id]);
		}
		return entities[model.id];
	} else if(options.error){
		options.error(new Error('Id not valid! (className: ' + model.className +')'));
	}
}

function deleteEntity(model, options = {}){
	if(model.id || model.id === 0){
		var entities = getAllEntity(model);
		delete entities[model.id];
		if(entities.length === 0){
			piziLocalStorage.save(model.className, entities);
		} else {
			// Delete class store
			piziLocalStorage.delete(model.className);
			console.log("Store deleted: " + model.className);
		}
		if(options.success){
			options.success(entities[model.id]);
		}
	} else if(options.error){
		options.error(new Error('Id not valid! (className: ' + model.className +')'));
	}
}

function localStorageSync(method, model, options = {}){
	switch (method) {
		case 'create':
			saveEntity(model, options);
		break;

		case 'update':
			saveEntity(model, options);
		break;

		case 'delete':
			deleteEntity(model, options);
		break;

		case 'read':
			if(model instanceof Backbone.Model){
				getEntity(model, options);
			} else if(model instanceof Backbone.Collection){
				getAllEntity(model, options);
			}
		break;
	}
}

let LocalStorageModel = Backbone.Model.extend({
	sync: function(){
		localStorageSync.apply(this, arguments);
	}
});

let LocalStorageCollection = Backbone.Collection.extend({
	model: LocalStorageModel,
	sync: function(){
		localStorageSync.apply(this, arguments);
	}
});

let Session = LocalStorageModel.extend({
	className : 'session',
	put(key, value, opts = {}){
		if(value && value.toJSON){
			value = value.toJSON();
		}
		this.set(key, value);
		this.set('date', new Date(), {silent: true});
		this.save({}, _.extend(_.clone(opts), {success: null}));
	},
	pick(key){
		return this.get(key);
	}
});

let session;
function getSession(){
	session = session || new Session({id: 1});
	session.fetch();
	return session;
}

export default {
	Model : LocalStorageModel,
	Collection : LocalStorageCollection,
	getSession : getSession,
	saveEntity : saveEntity,
	deleteEntity : deleteEntity,
	getEntity : getEntity,
	getAllEntity : getAllEntity
};