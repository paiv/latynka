
const BundledTranslitTables = require('./bundled_tables')


class Settings {

    constructor(storage, callback) {
        this.db = storage.local
        this.callback = callback

        this.default_active_tables = [
            'abecadlo',
            'jirecek',
            'kmu_2010',
            'lucuk',
            'melnyk',
            'nova_latynka',
            'iso9_1995',
            'tkpn_combo',
        ]

        this.storage_keys = {
            enabled: 'latynka:enabled',
            selected_table_id: 'latynka:selected_table_id',
            active_table_ids: 'latynka:active_table_ids',
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

    _get_string(key, default_value) {
        const value = this.cache[key]
        return ['', value].join('') || default_value
    }

    _get_array(key, default_value) {
        const value = this.cache[key]
        return Array.isArray(value) ? value : default_value
    }

    get enabled() {
        return this._get_bool(this.storage_keys.enabled)
    }

    set enabled(value) {
        this._store(this.storage_keys.enabled, value)
    }

    get selected_table_id() {
        return this._get_string(this.storage_keys.selected_table_id, 'nova_latynka')
    }

    set selected_table_id(value) {
        this._store(this.storage_keys.selected_table_id, value)
    }

    get selected_translit_table() {
        const tables = this.active_tables
        const selected_id = this.selected_table_id
        return tables.find((tbl) => tbl.id === selected_id) || tables[0]
    }

    bundled_tables() {
        const all_tables = Object.keys(BundledTranslitTables).map((key) => Object.assign({id: key}, BundledTranslitTables[key]))
        return all_tables
            .sort((a,b) => (a.title || '').localeCompare(b.title))
    }

    user_tables() {
        const all_tables = []
        return all_tables
            .sort((a,b) => (a.title || '').localeCompare(b.title))
    }

    all_tables() {
        return this.bundled_tables().concat(this.user_tables())
    }

    get active_table_ids() {
        return this._get_array(this.storage_keys.active_table_ids, this.default_active_tables)
    }

    set active_table_ids(value) {
        this._store(this.storage_keys.active_table_ids, value)
    }

    get active_tables() {
        const active_ids = new Set(this.active_table_ids)
        const all_tables = this.bundled_tables()

        const filtered = all_tables
            .filter((x) => active_ids.has(x.id) )
            .sort((a,b) => (a.title || '').localeCompare(b.title))

        return filtered
    }

    get_table(table_id) {
        return this.all_tables().find((x) => x.id === table_id)
    }
}


module.exports = {
    Settings,
}
