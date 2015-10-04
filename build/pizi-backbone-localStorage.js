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
			for (var date in dates) {
				if (dates.hasOwnProperty(date) && dates[date]) {
					data[date] = new Date(dates[date]);
				}
			}
		});
		if (options.success) {
			options.success(entities);
		}
		return entities;
	}

	function saveEntity(model) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		if (model instanceof _Backbone["default"].Model) {
			var entities = getAllEntity(model);

			var data = model.toJSON();

			var dates = _.pick(data, ['date'].concat(model.dates));
			for (var date in dates) {
				if (dates.hasOwnProperty(date)) {
					if (dates[date] instanceof Date) {
						// Deal Dates
						data[date] = dates[date].getTime();
					}
				}
			}

			var id = 0;
			// No id defined
			if (!model.id) {
				// Check in the stored ids if one is defined for this class
				if (!ids[model.className]) {
					for (var entity in entities) {
						if (!isNaN(entity.id) && entity.id > id) {
							id = entity.id;
						}
					}
					ids[model.className] = id;
				}
				// Increment to have the new key
				ids[model.className] = ids[model.className]++;
				entities[ids[model.className]] = data;
				_piziLocalStorage2["default"].save(model.className, entities);
				// Returning the index to let Backbone set it (not sure !)
				data = {};
				data[model.idAttribute] = ids[model.className];
				if (options.success) {
					options.success(data);
				}
				return data;
			} else {
				entities[model.id] = data;
				_piziLocalStorage2["default"].save(model.className, entities);
				if (options.success) {
					options.success();
				}
			}
		} else if (options.error) {
			options.error(new Error('Not Backbone model!'));
		}
	}

	function getEntity(model) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		if (model.id || model.id === 0) {
			var entities = getAllEntity(model);
			if (options.success) {
				options.success(entities[model.id]);
			}
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
			_piziLocalStorage2["default"].save(model.className, entities);
			if (options.success) {
				options.success(entities[model.id]);
			}
		} else if (options.error) {
			options.error(new Error('Id not valid! (className: ' + model.className + ')'));
		}
	}

	function overrideBackboneSync() {
		var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		if (_Backbone["default"]) {
			_Backbone["default"].defaultSync = _Backbone["default"].sync;
			_Backbone["default"].sync = function (method, model) {
				var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

				var datas;

				switch (method) {
					case 'create':
						datas = saveEntity(model, options);
						break;

					case 'update':
						datas = saveEntity(model, options);
						break;

					case 'delete':
						deleteEntity(model, options);
						break;

					case 'read':
						if (model instanceof _Backbone["default"].Model) {
							datas = getEntity(model, options);
						} else if (model instanceof _Backbone["default"].Collection) {
							datas = _.toArray(getAllEntity(model, options));
						}
						break;
				}
				if (opts.session) {
					initSession(opts);
				} else if (opts.success) {
					opts.success(datas);
				}
			};
		}
	}

	function initSession(opts) {
		opts.session = false;
		var Session = _Backbone["default"].Model.extend({
			className: 'session',
			put: function put(key, value) {
				if (value && value.toJSON) {
					value = value.toJSON();
				}
				this.set(key, value);
			},
			pick: function pick(key) {
				return this.get(key);
			}
		});

		var createSesssion = function createSesssion() {
			_Backbone["default"].session = new Session({ id: 1, date: new Date() });
			_Backbone["default"].session.save({}, _.extend(_.clone(opts), { success: null }));
		};

		var autoSaveSession = function autoSaveSession(changes) {
			_Backbone["default"].session.on('change', function () {
				_Backbone["default"].session.set('date', new Date(), { silent: true });
				_Backbone["default"].session.save({}, _.extend(_.clone(opts), { success: null }));
			});
		};

		var oldSession = new Session({ id: 1 });
		oldSession.fetch({
			success: function success(data) {
				var oldSessionDate = oldSession.get('date');
				if (oldSessionDate instanceof Date && new Date().getTime() - oldSessionDate.getTime() < 3600 * 1000) {
					console.log('Old session getted!' + oldSession.get('date'));
					oldSession.set('date', new Date());
					_Backbone["default"].session = oldSession;
				} else {
					createSesssion();
				}
				autoSaveSession();
				if (opts.success) {
					opts.success();
				}
			},
			error: function error() {
				createSesssion();
				autoSaveSession();
				if (opts.error) {
					opts.error();
				}
			},
			persist: opts.persist
		});
	}

	function restoreDefaultSync() {
		_Backbone["default"].sync = _Backbone["default"].defaultSync;
	}

	module.exports = {
		apply: overrideBackboneSync,
		disable: restoreDefaultSync,
		initSession: initSession,
		saveEntity: saveEntity,
		deleteEntity: deleteEntity,
		getEntity: getEntity,
		getAllEntity: getAllEntity
	};
});
