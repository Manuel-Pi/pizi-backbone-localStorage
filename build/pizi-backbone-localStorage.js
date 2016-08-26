(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports", "module", "backbone", "pizi-localStorage"], factory);
	} else if (typeof exports !== "undefined" && typeof module !== "undefined") {
		factory(exports, module, require("backbone"), require("pizi-localStorage"));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.Backbone, global.piziLocalStorage);
		global.piziBackboneLocalStorage = mod.exports;
	}
})(this, function (exports, module, _backbone, _piziLocalStorage) {
	"use strict";

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _Backbone = _interopRequireDefault(_backbone);

	var _piziLocalStorage2 = _interopRequireDefault(_piziLocalStorage);

	var idsExtension = '-map';
	var ids = {};

	function getAllEntity(model) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		var entities = _piziLocalStorage2["default"].get(model.className || model.model && model.model.prototype.className) || {};
		_.each(entities, function (data) {
			var dates = model.model && model.model.prototype.dates ? model.model.prototype.dates : model.dates;
			dates = _.pick(data, ['date'].concat(dates));
			for (var date in dates) if (dates.hasOwnProperty(date) && dates[date]) data[date] = new Date(dates[date]);
		});
		if (options.success) options.success(entities);
		return entities;
	}
	function saveEntity(model) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		if (model instanceof _Backbone["default"].Model) {
			var entities = getAllEntity(model);
			var data = model.toJSON(options);
			var dates = _.pick(data, ['date'].concat(model.dates));
			for (var date in dates) {
				if (dates.hasOwnProperty(date) && dates[date] instanceof Date) data[date] = dates[date].getTime();
			} // No id defined
			if (!model.id) {
				// Check in the stored ids if one is defined for this class
				if (!ids[model.className]) {
					var id = 0;
					for (var entity in entities) if (!isNaN(entity.id) && entity.id > id) id = entity.id;
					ids[model.className] = id;
				}
				// Increment to have the new key
				ids[model.className] = ids[model.className]++;
				entities[ids[model.className]] = data;
				_piziLocalStorage2["default"].save(model.className, entities);
				// Returning the index to let Backbone set it (not sure !)
				data = {};
				data[model.idAttribute] = ids[model.className];
				if (options.success) options.success(data);
				return data;
			} else {
				entities[model.id] = data;
				_piziLocalStorage2["default"].save(model.className, entities);
				if (options.success) options.success();
			}
		} else if (options.error) {
			options.error(new Error('Not Backbone model!'));
		}
	}
	function getEntity(model) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		if (model.id || model.id === 0) {
			var entities = getAllEntity(model);
			if (options.success) options.success(entities[model.id]);
			return entities[model.id];
		} else if (options.error) {
			options.error(new Error('Id not valid! (className: ' + model.className + ')'));
		}
	}
	function deleteEntity(model) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		if (model.id || model.id === 0) {
			var entities = getAllEntity(model);
			delete entities[model.id];
			if (entities.length === 0) {
				_piziLocalStorage2["default"].save(model.className, entities);
			} else {
				// Delete class store
				_piziLocalStorage2["default"]["delete"](model.className);
				console.log("Store deleted: " + model.className);
			}
			if (options.success) options.success(entities[model.id]);
		} else if (options.error) {
			options.error(new Error('Id not valid! (className: ' + model.className + ')'));
		}
	}
	function localStorageSync(method, model) {
		var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

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
				if (model instanceof _Backbone["default"].Model) {
					getEntity(model, options);
				} else if (model instanceof _Backbone["default"].Collection) {
					getAllEntity(model, options);
				}
				break;
		}
	}
	// Define LocalStorageModel, LocalStorageCollection, and Session
	var LocalStorageModel = _Backbone["default"].Model.extend({ sync: function sync() {
			localStorageSync.apply(this, arguments);
		} });
	var LocalStorageCollection = _Backbone["default"].Collection.extend({ model: LocalStorageModel, sync: function sync() {
			localStorageSync.apply(this, arguments);
		} });
	var Session = LocalStorageModel.extend({
		className: 'session',
		defaults: {
			id: 1,
			date: new Date()
		},
		put: function put(key, value) {
			var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			if (value && value.toJSON) value = value.toJSON();
			this.set(key, value);
			this.set('date', new Date(), { silent: true });
			this.save({}, _.extend(_.clone(opts), { success: null }));
		}
	});

	var session = undefined;
	function getSession() {
		var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		session = session || new Session();
		session.fetch(opts);
		return session;
	}

	module.exports = {
		Model: LocalStorageModel,
		Collection: LocalStorageCollection,
		getSession: getSession
	};
});
