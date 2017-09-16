
const browserapi = require('./browserapi')
    , random = require('./random')
    , requests = require('./requests')


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
            whitelist_enabled: 'latynka:whitelist_enabled',
            blacklist_enabled: 'latynka:blacklist_enabled',
            site_whitelist: 'latynka:site_whitelist',
            site_blacklist: 'latynka:site_blacklist',
            selected_table_id: 'latynka:selected_table_id',
            active_table_ids: 'latynka:active_table_ids',
            bundled_tables: 'latynka:bundled_tables',
            user_tables: 'latynka:user_tables',
            preview_text: 'latynka:preview_text',
            default_preview_text: 'latynka:default_preview_text',
        }

        this.cache = {}
        this.blacklist = new Set()
        this.whitelist = new Set()

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

                if (key === this.storage_keys.site_blacklist) {
                    this.blacklist = new Set(this.site_blacklist)
                }
                else if (key === this.storage_keys.site_whitelist) {
                    this.whitelist = new Set(this.site_whitelist)
                }
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

            this.blacklist = new Set(this.site_blacklist)
            this.whitelist = new Set(this.site_whitelist)

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

    _get_bool(key, default_value) {
        const value = this.cache[key]
        return value === false ? value : value === true ? value : default_value
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
        return Array.isArray(value) ? value.slice() : (default_value || [])
    }

    get enabled() {
        return this._get_bool(this.storage_keys.enabled, true)
    }
    set enabled(value) {
        this._store(this.storage_keys.enabled, value)
    }

    get whitelist_enabled() {
        return this._get_bool(this.storage_keys.whitelist_enabled, false)
    }
    set whitelist_enabled(value) {
        this._store(this.storage_keys.whitelist_enabled, value)
    }

    get blacklist_enabled() {
        return this._get_bool(this.storage_keys.blacklist_enabled, false)
    }
    set blacklist_enabled(value) {
        this._store(this.storage_keys.blacklist_enabled, value)
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
        const all_tables = this._get_array(this.storage_keys.bundled_tables)
        return all_tables
            .sort((a,b) => (a.title || '').localeCompare(b.title))
    }

    set_bundled_tables(value) {
        const all_tables = Object.keys(value).map((key) => value[key])
            .sort((a,b) => (a.title || '').localeCompare(b.title))

        this.save({
            bundled_tables: all_tables,
        })
    }

    user_tables() {
        const all_tables = this._get_array(this.storage_keys.user_tables)
        return all_tables
            .sort((a,b) => (a.seq_no || 0) - (b.seq_no || 0))
    }

    get user_tables_seq_no() {
        return 1 + ((this.user_tables().pop() || {}).seq_no || 0)
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
        const all_tables = this.all_tables()

        return all_tables
            .filter((x) => active_ids.has(x.id) )
    }

    get_table(table_id) {
        return this.all_tables().find((x) => x.id === table_id)
    }

    get site_blacklist() {
        return this._get_array(this.storage_keys.site_blacklist)
    }

    set site_blacklist(value) {
        return this._store(this.storage_keys.site_blacklist, value)
    }

    get site_whitelist() {
        return this._get_array(this.storage_keys.site_whitelist)
    }

    set site_whitelist(value) {
        return this._store(this.storage_keys.site_whitelist, value)
    }

    get default_preview_text() {
        return this._get_string(this.storage_keys.default_preview_text)
    }

    set default_preview_text(value) {
        this._store(this.storage_keys.default_preview_text, value)
    }

    get preview_text() {
        return this._get_string(this.storage_keys.preview_text) || this.default_preview_text
    }

    set preview_text(value) {
        this._store(this.storage_keys.preview_text, value)
    }

    _host(url) {
        try {
            if (!/:\/\//.test(url)) {
                url = 'http://' + url
            }
            else if (!/^https?:\/\//i.test(url)) {
                return undefined
            }
            const parts = new URL(url) || {}
            return (parts.host || '').toLowerCase()
        }
        catch (e) {
        }
    }

    _parse_site_list(text) {
        return (text || '').split('\n')
            .map((line) => this._host(line))
            .filter((line) => !!line)
    }

    set_site_blacklist_from_text(text) {
        this.site_blacklist = this._parse_site_list(text)
    }

    set_site_whitelist_from_text(text) {
        this.site_whitelist = this._parse_site_list(text)
    }

    enabled_for_url(url) {
        const host = this._host(url)

        if (!host) {
            return false
        }

        if (this.blacklist_enabled) {
            if (this.blacklist.has(host)) {
                return false
            }
            if (this.site_blacklist.find((rule) => rule.startsWith('.') && host.endsWith(rule))) {
                return false
            }
        }

        if (this.whitelist_enabled) {
            if (this.whitelist.has(host)) {
                return true
            }
            if (this.site_whitelist.find((rule) => rule.startsWith('.') && host.endsWith(rule))) {
                return true
            }
        }

        return this.enabled
    }

    whitelist_add(url) {
        const host = this._host(url)
        if (host) {
            this.blacklist.delete(host)
            this.whitelist.add(host)
            this._store_whiteblacklist()
        }
    }

    whitelist_remove(url) {
        const host = this._host(url)
        if (host) {
            this.whitelist.delete(host)
            this._store_whiteblacklist()
        }
    }

    blacklist_add(url) {
        const host = this._host(url)
        if (host) {
            this.whitelist.delete(host)
            this.blacklist.add(host)
            this._store_whiteblacklist()
        }
    }

    blacklist_remove(url) {
        const host = this._host(url)
        if (host) {
            this.blacklist.delete(host)
            this._store_whiteblacklist()
        }
    }

    _store_whiteblacklist() {
        this.save({
            site_whitelist: [...this.whitelist],
            site_blacklist: [...this.blacklist],
        })
    }

    import_table(table) {
        if (!table.id) {
            const seq_no = this.user_tables_seq_no
            table.id = this.generate_table_id('', seq_no)
            table.seq_no = seq_no
        }

        const user_tables = this.user_tables()
        user_tables.push(table)

        const active = this.active_table_ids
        active.push(table.id)

        this.save({
            user_tables: user_tables,
            active_table_ids: active,
        })
    }

    generate_table_id(from_id, seq_no) {
        seq_no = `000${seq_no}`.slice(-3)

        from_id = (from_id || '').replace(/\..*$/, '')
        const suffix = random.string(8)

        return `${from_id}.${seq_no}.${suffix}`
    }

    delete_user_table(table_id) {
        const user_tables = this.user_tables()
            .filter((table) => table.id !== table_id)

        const active = new Set(this.active_table_ids)
        active.delete(table_id)

        this.save({
            user_tables: user_tables,
            active_table_ids: [...active],
        })
    }

    update_user_table(table) {
        const table_id = table.id

        const user_tables = this.user_tables()
            .filter((table) => table.id !== table_id)

        user_tables.push(table)

        this.save({
            user_tables: user_tables,
        })
    }

    set_defaults() {
        requests.get(browserapi.runtime.getURL('data/bundled_tables.json'), (text) => {
            this.set_bundled_tables(JSON.parse(text))
        })

        requests.get(browserapi.runtime.getURL('data/preview.txt'), (text) => {
            this.default_preview_text = text
        })
    }
}


module.exports = {
    Settings,
}
