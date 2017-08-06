import Backbone from "backbone";
import piziLocalStorage from "pizi-localStorage";

const idsExtension = '-map';
let ids = {};

function getAllEntity(model, options = {}) {
    model.className = model.className || 'BackboneModel';
    options.storage = options.storage || model.storage;
    const entities = piziLocalStorage.get(model.className || model.model && model.model.prototype.className, options) || {};
    _.each(entities, (data) => {
        let dates = model.model && model.model.prototype.dates ? model.model.prototype.dates : model.dates;
        dates = _.pick(data, ['date'].concat(dates));
        for (var date in dates)
            if (dates.hasOwnProperty(date) && dates[date]) data[date] = new Date(dates[date]);
    });
    if (options.success) options.success(entities);
    return entities;
}

function saveEntity(model, options = {}) {
    if (model instanceof Backbone.Model) {
        let entities = getAllEntity(model, { storage: options.storage || model.storage });
        let data = model.toJSON(options);
        let dates = _.pick(data, ['date'].concat(model.dates));
        for (const date in dates)
            if (dates.hasOwnProperty(date) && dates[date] instanceof Date) data[date] = dates[date].getTime();
        model.className = model.className || 'BackboneModel';
        options.storage = options.storage || model.storage;
        // No id defined
        if (!model.id) {
            // Check in the stored ids if one is defined for this class
            if (!ids[model.className]) {
                let id = 0;
                for (var entity in entities)
                    if (!isNaN(entity.id) && entity.id > id) id = entity.id;
                ids[model.className] = id;
            }
            // Increment to have the new key
            ids[model.className] = ids[model.className]++;
            entities[ids[model.className]] = data;
            piziLocalStorage.save(model.className, entities, options);
            // Returning the index to let Backbone set it (not sure !)
            data = {};
            data[model.idAttribute] = ids[model.className];
            if (options.success) options.success(data);
            return data;
        } else {
            entities[model.id] = data;
            piziLocalStorage.save(model.className, entities, options);
            if (options.success) options.success();
        }
    } else if (options.error) {
        options.error(new Error('Not Backbone model!'));
    }
}

function getEntity(model, options = {}) {
    model.className = model.className || 'BackboneModel';
    if (model.id || model.id === 0) {
        let entities = getAllEntity(model, { storage: options.storage || model.storage });
        if (options.success) options.success(entities[model.id]);
        return entities[model.id];
    } else if (options.error) {
        options.error(new Error('Id not valid! (className: ' + model.className + ')'));
    }
}

function deleteEntity(model, options = {}) {
    model.className = model.className || 'BackboneModel';
    options.storage = options.storage || model.storage;
    if (model.id || model.id === 0) {
        let entities = getAllEntity(model, { storage: options.storage || model.storage });
        delete entities[model.id];
        if (entities.length === 0) {
            piziLocalStorage.save(model.className, entities, options);
        } else {
            // Delete class store
            piziLocalStorage.delete(model.className, options);
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
            if (model instanceof Backbone.Model) {
                getEntity(model, options);
            } else if (model instanceof Backbone.Collection) {
                getAllEntity(model, options);
            }
            break;
    }
}

// Override Backbone sync
const sync = Backbone.sync;
Backbone.sync = (method, model, opts = {}) => {
    let storage = opts.storage || model.storage;
    if (storage === 'local' || storage === 'session') {
        localStorageSync.call(this, method, model, opts);
    } else {
        sync.call(this, method, model, opts);
    }
};

// Create session object definition
let Session = Backbone.Model.extend({
    className: 'Session',
    storage: 'session',
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
// Instantiate session
function getSession(opts = {}) {
    session = session || new Session();
    session.fetch(opts);
    return session;
}

export default {
    getSession: getSession
};