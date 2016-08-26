define(["module", "exports", "backbone", "pizi-localStorage"], function (module, exports, _backbone, _piziLocalStorage) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _backbone2 = _interopRequireDefault(_backbone);

	var _piziLocalStorage2 = _interopRequireDefault(_piziLocalStorage);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	const idsExtension = '-map';
	let ids = {};

	function getAllEntity(model, options = {}) {
		const entities = _piziLocalStorage2.default.get(model.className || model.model && model.model.prototype.className) || {};
		_.each(entities, data => {
			let dates = model.model && model.model.prototype.dates ? model.model.prototype.dates : model.dates;
			dates = _.pick(data, ['date'].concat(dates));
			for (var date in dates) if (dates.hasOwnProperty(date) && dates[date]) data[date] = new Date(dates[date]);
		});
		if (options.success) options.success(entities);
		return entities;
	}
	function saveEntity(model, options = {}) {
		if (model instanceof _backbone2.default.Model) {
			let entities = getAllEntity(model);
			let data = model.toJSON(options);
			let dates = _.pick(data, ['date'].concat(model.dates));
			for (const date in dates) if (dates.hasOwnProperty(date) && dates[date] instanceof Date) data[date] = dates[date].getTime();
			// No id defined
			if (!model.id) {
				// Check in the stored ids if one is defined for this class
				if (!ids[model.className]) {
					let id = 0;
					for (var entity in entities) if (!isNaN(entity.id) && entity.id > id) id = entity.id;
					ids[model.className] = id;
				}
				// Increment to have the new key
				ids[model.className] = ids[model.className]++;
				entities[ids[model.className]] = data;
				_piziLocalStorage2.default.save(model.className, entities);
				// Returning the index to let Backbone set it (not sure !)
				data = {};
				data[model.idAttribute] = ids[model.className];
				if (options.success) options.success(data);
				return data;
			} else {
				entities[model.id] = data;
				_piziLocalStorage2.default.save(model.className, entities);
				if (options.success) options.success();
			}
		} else if (options.error) {
			options.error(new Error('Not Backbone model!'));
		}
	}
	function getEntity(model, options = {}) {
		if (model.id || model.id === 0) {
			let entities = getAllEntity(model);
			if (options.success) options.success(entities[model.id]);
			return entities[model.id];
		} else if (options.error) {
			options.error(new Error('Id not valid! (className: ' + model.className + ')'));
		}
	}
	function deleteEntity(model, options = {}) {
		if (model.id || model.id === 0) {
			let entities = getAllEntity(model);
			delete entities[model.id];
			if (entities.length === 0) {
				_piziLocalStorage2.default.save(model.className, entities);
			} else {
				// Delete class store
				_piziLocalStorage2.default.delete(model.className);
				console.log("Store deleted: " + model.className);
			}
			if (options.success) options.success(entities[model.id]);
		} else if (options.error) {
			options.error(new Error('Id not valid! (className: ' + model.className + ')'));
		}
	}
	function localStorageSync(method, model, options = {}) {
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
				if (model instanceof _backbone2.default.Model) {
					getEntity(model, options);
				} else if (model instanceof _backbone2.default.Collection) {
					getAllEntity(model, options);
				}
				break;
		}
	}
	// Define LocalStorageModel, LocalStorageCollection, and Session
	let LocalStorageModel = _backbone2.default.Model.extend({ sync() {
			localStorageSync.apply(this, arguments);
		} });
	let LocalStorageCollection = _backbone2.default.Collection.extend({ model: LocalStorageModel, sync() {
			localStorageSync.apply(this, arguments);
		} });
	let Session = LocalStorageModel.extend({
		className: 'session',
		defaults: {
			id: 1,
			date: new Date()
		},
		put(key, value, opts = {}) {
			if (value && value.toJSON) value = value.toJSON();
			this.set(key, value);
			this.set('date', new Date(), { silent: true });
			this.save({}, _.extend(_.clone(opts), { success: null }));
		}
	});

	let session;
	function getSession(opts = {}) {
		session = session || new Session();
		session.fetch(opts);
		return session;
	}

	exports.default = {
		Model: LocalStorageModel,
		Collection: LocalStorageCollection,
		getSession: getSession
	};
	module.exports = exports["default"];
});
