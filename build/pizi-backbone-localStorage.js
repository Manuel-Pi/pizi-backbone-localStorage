(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("backbone"), require("pizi-localStorage"));
	else if(typeof define === 'function' && define.amd)
		define("pizi-backbone-localStorage", ["backbone", "pizi-localStorage"], factory);
	else if(typeof exports === 'object')
		exports["pizi-backbone-localStorage"] = factory(require("backbone"), require("pizi-localStorage"));
	else
		root["pizi-backbone-localStorage"] = factory(root["backbone"], root["pizi-localStorage"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("backbone");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("pizi-localStorage");

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_backbone__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_backbone___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_backbone__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_pizi_localStorage__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_pizi_localStorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_pizi_localStorage__);
var _this = this;




var idsExtension = '-map';
var ids = {};

function getAllEntity(model) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    model.className = model.className || 'BackboneModel';
    options.storage = options.storage || model.storage;
    var entities = __WEBPACK_IMPORTED_MODULE_1_pizi_localStorage___default.a.get(model.className || model.model && model.model.prototype.className, options) || {};
    _.each(entities, function (data) {
        var dates = model.model && model.model.prototype.dates ? model.model.prototype.dates : model.dates;
        dates = _.pick(data, ['date'].concat(dates));
        for (var date in dates) {
            if (dates.hasOwnProperty(date) && dates[date]) data[date] = new Date(dates[date]);
        }
    });
    if (options.success) options.success(entities);
    return entities;
}

function saveEntity(model) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (model instanceof __WEBPACK_IMPORTED_MODULE_0_backbone___default.a.Model) {
        var entities = getAllEntity(model, { storage: options.storage || model.storage });
        var data = model.toJSON(options);
        var dates = _.pick(data, ['date'].concat(model.dates));
        for (var date in dates) {
            if (dates.hasOwnProperty(date) && dates[date] instanceof Date) data[date] = dates[date].getTime();
        }model.className = model.className || 'BackboneModel';
        options.storage = options.storage || model.storage;
        // No id defined
        if (!model.id) {
            // Check in the stored ids if one is defined for this class
            if (!ids[model.className]) {
                var id = 0;
                for (var entity in entities) {
                    if (!isNaN(entity.id) && entity.id > id) id = entity.id;
                }ids[model.className] = id;
            }
            // Increment to have the new key
            ids[model.className] = ids[model.className]++;
            entities[ids[model.className]] = data;
            __WEBPACK_IMPORTED_MODULE_1_pizi_localStorage___default.a.save(model.className, entities, options);
            // Returning the index to let Backbone set it (not sure !)
            data = {};
            data[model.idAttribute] = ids[model.className];
            if (options.success) options.success(data);
            return data;
        } else {
            entities[model.id] = data;
            __WEBPACK_IMPORTED_MODULE_1_pizi_localStorage___default.a.save(model.className, entities, options);
            if (options.success) options.success();
        }
    } else if (options.error) {
        options.error(new Error('Not Backbone model!'));
    }
}

function getEntity(model) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    model.className = model.className || 'BackboneModel';
    if (model.id || model.id === 0) {
        var entities = getAllEntity(model, { storage: options.storage || model.storage });
        if (options.success) options.success(entities[model.id]);
        return entities[model.id];
    } else if (options.error) {
        options.error(new Error('Id not valid! (className: ' + model.className + ')'));
    }
}

function deleteEntity(model) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    model.className = model.className || 'BackboneModel';
    options.storage = options.storage || model.storage;
    if (model.id || model.id === 0) {
        var entities = getAllEntity(model, { storage: options.storage || model.storage });
        delete entities[model.id];
        if (entities.length === 0) {
            __WEBPACK_IMPORTED_MODULE_1_pizi_localStorage___default.a.save(model.className, entities, options);
        } else {
            // Delete class store
            __WEBPACK_IMPORTED_MODULE_1_pizi_localStorage___default.a.delete(model.className, options);
            console.log("Store deleted: " + model.className);
        }
        if (options.success) options.success(entities[model.id]);
    } else if (options.error) {
        options.error(new Error('Id not valid! (className: ' + model.className + ')'));
    }
}

function localStorageSync(method, model) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

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
            if (model instanceof __WEBPACK_IMPORTED_MODULE_0_backbone___default.a.Model) {
                getEntity(model, options);
            } else if (model instanceof __WEBPACK_IMPORTED_MODULE_0_backbone___default.a.Collection) {
                getAllEntity(model, options);
            }
            break;
    }
}

// Override Backbone sync
var sync = __WEBPACK_IMPORTED_MODULE_0_backbone___default.a.sync;
__WEBPACK_IMPORTED_MODULE_0_backbone___default.a.sync = function (method, model) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var storage = opts.storage || model.storage;
    if (storage === 'local' || storage === 'session') {
        localStorageSync.call(_this, method, model, opts);
    } else {
        sync.call(_this, method, model, opts);
    }
};

// Create session object definition
var Session = __WEBPACK_IMPORTED_MODULE_0_backbone___default.a.Model.extend({
    className: 'Session',
    storage: 'session',
    defaults: {
        id: 1,
        date: new Date()
    },
    put: function put(key, value) {
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (value && value.toJSON) value = value.toJSON();
        this.set(key, value);
        this.set('date', new Date(), { silent: true });
        this.save({}, _.extend(_.clone(opts), { success: null }));
    }
});
var session = void 0;
// Instantiate session
function getSession() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    session = session || new Session();
    session.fetch(opts);
    return session;
}

/* harmony default export */ __webpack_exports__["default"] = ({
    getSession: getSession
});

/***/ })
/******/ ]);
});