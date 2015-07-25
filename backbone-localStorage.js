(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['backbone', 'pizi-localStorage'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('backbone', 'pizi-localStorage'));
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Backbone, root.localStorage);
    }
}(this, function(Backbone, localStorage){

	var idsExtension = '-map';

	var ids = {};

	function getAllEntity(model, options){
		var entities = localStorage.get(model.className || model.model.prototype.className) || {};
		_.each(entities, function(data){
			var dates = model.model && model.model.prototype.dates ? model.model.prototype.dates : model.dates;
			dates = _.pick(data, ['date'].concat(dates));
			for(var date in dates){
				if(dates.hasOwnProperty(date) && dates[date]){
					data[date] = new Date(dates[date]);
				}
			}
		});
		if(options && options.success){
			options.success(entities);
		}
		return entities;
	}

	function saveEntity(model, options){
		if(model instanceof Backbone.Model){
			var entities = getAllEntity(model);

			var data = model.toJSON();

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
			if(!model.id){
				if(!ids[model.className]){
					for(var entity in entities){
						if(!isNaN(entity.id) && entity.id > id){
							id = entity.id;
						}
					}
					ids[model.className] = id;
				} else {
					id = ids[model.className];
				}
				ids[model.className] = ids[model.className]++;
				entities[ids[model.className]] = data;
				localStorage.save(model.className, entities);
				data = {};
				data[model.idAttribute] = ids[model.className];
				if(options && options.success){
					options.success(data);
				}
				return data;
			} else {
				entities[model.id] = data;
				localStorage.save(model.className, entities);
				if(options && options.success){
					options.success();
				}
			}
		} else {
			console.log('Not Backbone Model!');
		}
	}

	function getEntity(model, options){
		if(model.id){
			var entities = getAllEntity(model);
			if(options && options.success){
				options.success(entities[model.id]);
			}
			return entities[model.id];
		} else {
			console.log('Id not valid!');
		}
	}

	function deleteEntity(model, options){
		if(model.id){
			var entities = getAllEntity(model);
			delete entities[model.id];
			localStorage.save(model.className, entities);
			if(options && options.success){
				options.success(entities[model.id]);
			}
		} else {
			console.log('Id not valid!');
		}
	}

	function overrideBackboneSync(opts){

		opts = opts || {session:true};

		if(Backbone){
			Backbone.defaultSync = Backbone.sync;
			Backbone.sync = function(method, model, options) {

				options = options || (options = {}) ;

				var datas;

				switch (method) {
					case 'create':
						datas = saveEntity(model);
					break;

					case 'update':
						datas = saveEntity(model);
					break;

					case 'delete':
						deleteEntity(model.id);
					break;

					case 'read':
						if(model instanceof Backbone.Model){
							datas = getEntity(model);
						} else if(model instanceof Backbone.Collection){
							datas = _.toArray(getAllEntity(model));
						}
					break;
				}
				if(opts.session){
					initSession(opts);
				} else if(opts.success){
					opts.success(datas);
				}
			};
		}
	}

	function initSession(opts){
		var Session = Backbone.Model.extend({
			className : 'session',
			put : function(key, value){
				if(value && value.toJSON){
					value = value.toJSON();
				}
				this.set(key, value);
			},
			pick : function(key){
				return this.get(key);
			}
		});

		var createSesssion = function(){
			Backbone.session = new Session({id: 1, date: new Date()});
			Backbone.session.save({}, _.extend(_.clone(opts), {success: null}));
		};

		var autoSaveSession = function(changes){
			Backbone.session.on('change', function(){
				Backbone.session.set('date', new Date(), {silent: true});
				Backbone.session.save({}, _.extend(_.clone(opts), {success: null}));
			});
		};

		var oldSession = new Session({id: 1});
		oldSession.fetch({
			success : function(data){
				var oldSessionDate = oldSession.get('date');
				if(oldSessionDate instanceof Date && (new Date()).getTime() - oldSessionDate.getTime() < 3600 * 1000 ){
					console.log('Old session getted!' + oldSession.get('date'));
					oldSession.set('date', new Date());
					Backbone.session = oldSession;
				} else {
					createSesssion();
				}
				autoSaveSession();
				if(opts.success){
					opts.success();
				}
			},
			error: function(){
				createSesssion();
				autoSaveSession();
				if(opts.error){
					opts.error();
				}
			},
			persist: opts.persist
		});
	}

	function restoreDefaultSync(){
		Backbone.sync = Backbone.defaultSync;
	}

	return {
		apply : overrideBackboneSync,
		disable : restoreDefaultSync,
		initSession : initSession,
		saveEntity : saveEntity,
		deleteEntity : deleteEntity,
		getEntity : getEntity,
		getAllEntity : getAllEntity
	};
}));