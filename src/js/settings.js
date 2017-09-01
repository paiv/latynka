
const BundledTranslitTables = require('./bundled_tables')


class Settings {

    constructor(storage, callback) {
        this.db = storage.local
        this.callback = callback

        this.storage_keys = {
            enabled: 'latynka:enabled',
            selected_table_id: 'latynka:selected_table_id',
        }

        this.cache = {}
        storage.onChanged.addListener((changes, area) => { this.onStorageChange(changes, area) })
        this._reload_cache()
    }

    onStorageChange(changes, area) {
        let has_changes = false
        Object.values(this.storage_keys).forEach((key) => {
            const change = changes[key]
            if (change) {
                this.cache[key] = change.newValue
                has_changes = true
            }
        })
        if (has_changes) {
            this.callback()
        }
    }

    _reload_cache() {
        this.db.get((stored) => {
            const cache = {}
            Object.values(this.storage_keys).forEach((key) => {
                cache[key] = stored[key]
            })
            this.cache = cache
            this.callback()
        })
    }

    _store(key, value) {
        const obj = {}
        obj[key] = value
        this.db.set(obj)
    }

    save(items) {
        const obj = {}
        for (let key in items) {
            obj[this.storage_keys[key]] = items[key]
        }
        this.db.set(obj)
    }

    _get_bool(key) {
        const value = this.cache[key]
        return value === false ? value : true
    }

    _get_int(key) {
        const value = this.cache[key]
        return Number.isInteger(value) ? value : 0
    }

    _get_string(key) {
        const value = this.cache[key]
        return '' + value
    }

    get enabled() {
        return this._get_bool(this.storage_keys.enabled)
    }

    set enabled(value) {
        this._store(this.storage_keys.enabled, value)
    }

    get selected_table_id() {
        return this._get_string(this.storage_keys.selected_table_id)
    }

    set selected_table_id(value) {
        this._store(this.storage_keys.selected_table_id, value)
    }

    get selected_translit_table() {
        const tables = this.active_tables
        return tables.find((tbl) => tbl.id === this.selected_table_id) || tables[0]
    }

    get active_tables() {
        const all_tables = Object.keys(BundledTranslitTables).map((key) => Object.assign({id: key}, BundledTranslitTables[key]))

        all_tables.sort((a,b) => (a.title || '').localeCompare(b.title))

        return all_tables
    }

    set active_tables(value) {

    }
}


module.exports = {
    Settings,
}
