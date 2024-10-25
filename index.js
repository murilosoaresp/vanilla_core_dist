class Opt {
    _has_value;
    _value;
    constructor() {
        this._has_value = false;
        this._value = null;
    }
    static none() {
        return new Opt();
    }
    static some(value) {
        let toReturn = Opt.none();
        toReturn._has_value = true;
        toReturn._value = value;
        return toReturn;
    }
    static of_value_or_null(value) {
        if (value === null) {
            return Opt.none();
        }
        else {
            return Opt.some(value);
        }
    }
    is_some() {
        return this._has_value;
    }
    is_none() {
        return !this.is_some();
    }
    unwrap() {
        return this._value;
    }
    value_or(t) {
        if (this.is_none()) {
            return t;
        }
        else {
            return this.value_unchecked();
        }
    }
    value_or_throw() {
        if (this.is_none()) {
            throw new Error();
        }
        else {
            return this.value_unchecked();
        }
    }
    value_unchecked() {
        return this._value;
    }
    do_if_some(fn) {
        if (this.is_some()) {
            fn(this.value_unchecked());
        }
    }
    do_if_none(fn) {
        if (this.is_none()) {
            fn();
        }
    }
    do(fn_some, fn_none) {
        if (this.is_some()) {
            return fn_some(this.value_unchecked());
        }
        else {
            return fn_none();
        }
    }
}

class HashSet {
    inner;
    constructor() {
        this.inner = new HashMap();
    }
    insert(hash) {
        this.inner.insert(hash, null);
    }
    remove(hash) {
        this.inner.remove(hash);
    }
    contains(hash) {
        return this.inner.contains_hash(hash);
    }
}

class List {
    inner;
    constructor() {
        this.inner = [];
    }
    static of(array) {
        let isntance = new List();
        isntance.inner = array;
        return isntance;
    }
    get_inner() { return this.inner; }
    len() {
        return this.inner.length;
    }
    is_valid_index(index) {
        return this.len() > 0
            && 0 <= index
            && index < this.len();
    }
    get(index) {
        return this.inner[index];
    }
    push(value) {
        this.inner.push(value);
    }
    append(other) {
        for (let t of other.iter()) {
            this.push(t);
        }
    }
    remove(index) {
        this.inner.slice(index, 1);
    }
    *iter() {
        for (let value of this.inner) {
            yield value;
        }
    }
    for_each(fn) {
        for (let value of this.inner) {
            fn(value);
        }
    }
    map(fn) {
        let output = new List();
        for (let value of this.iter()) {
            output.push(fn(value));
        }
        return output;
    }
    async map_async_all(fn) {
        let output = new List();
        for (let value of this.iter()) {
            output.push(fn(value));
        }
        let promise_all = await Promise.all(output.inner);
        return List.of(promise_all);
    }
    filter(fn) {
        let output = new List();
        for (let t of this.iter()) {
            if (fn(t)) {
                output.push(t);
            }
        }
        return output;
    }
    filter_map(fn) {
        let output = new List();
        for (let t of this.iter()) {
            let g_opt = fn(t);
            if (g_opt.is_some()) {
                output.push(g_opt.value_unchecked());
            }
        }
        return output;
    }
    to_hash_set(fn) {
        let output = new HashSet();
        this.for_each(t => output.insert(fn(t)));
        return output;
    }
    find_first(fn) {
        for (let value of this.iter()) {
            if (fn(value)) {
                return Opt.some(value);
            }
        }
        return Opt.none();
    }
    join(sep) {
        return this.inner.join(sep);
    }
}

class HashMap {
    inner;
    constructor() {
        this.inner = {};
    }
    len() {
        return Object.keys(this.inner).length;
    }
    insert(hash, value) {
        this.inner[hash] = value;
    }
    remove(hash) {
        delete this.inner[hash];
    }
    keys() {
        return Object.keys(this.inner);
    }
    contains_hash(hash) {
        return hash in this.inner;
    }
    get(hash) {
        if (this.contains_hash(hash)) {
            return Opt.some(this.inner[hash]);
        }
        else {
            return Opt.none();
        }
    }
    *iter() {
        for (let hash of this.keys()) {
            yield { hash, value: this.inner[hash] };
        }
    }
    to_list() {
        let output = new List();
        for (let hash of this.keys()) {
            output.push({ hash, value: this.inner[hash] });
        }
        return output;
    }
}

class HashTree {
    root_hash;
    value_map;
    parent_map;
    children_map;
    constructor() {
        this.root_hash = Opt.none();
        this.value_map = new HashMap();
        this.parent_map = new HashMap();
        this.children_map = new HashMap();
    }
    get(hash) {
        return this.value_map.get(hash);
    }
    get_item(hash) {
        if (this.contains(hash)) {
            let item = {
                value: this.get(hash).value_unchecked(),
                parent_hash: this.parent_map.get(hash).value_unchecked(),
                children: this.children_map.get(hash).value_unchecked(),
            };
            return Opt.some(item);
        }
        else {
            return Opt.none();
        }
    }
    contains(hash) {
        return this.value_map.contains_hash(hash);
    }
    remove(hash) {
        // checks if contains hash to remove
        if (this.contains(hash) === false) {
            return;
        }
        // remove hash from parent if children has one
        let parent_hash_opt = this.parent_map.get(hash).value_unchecked();
        if (parent_hash_opt.is_some()) {
            let parent_hash = parent_hash_opt.value_unchecked();
            let parent_children_list = this.children_map.get(parent_hash).value_unchecked();
            let filtered_parent_list = parent_children_list.filter(child_hash => child_hash !== hash);
            this.children_map.insert(parent_hash, filtered_parent_list);
        }
        // remove item
        this.remove_rec(hash);
        // if is root change root to none
        if (this.root_hash.is_some() && hash === this.root_hash.value_unchecked()) {
            this.root_hash = Opt.none();
        }
    }
    insert(hash, parent_opt, value) {
        // cehck if params are valid
        if (this.contains(hash)) {
            throw new Error();
        }
        if (parent_opt.is_none() && this.root_hash.is_some()) {
            throw new Error();
        }
        if (parent_opt.is_some()
            && this.value_map.contains_hash(parent_opt.value_unchecked()) === false) {
            throw new Error();
        }
        // insert value and start children list
        this.value_map.insert(hash, value);
        this.children_map.insert(hash, new List());
        this.parent_map.insert(hash, parent_opt);
        if (parent_opt.is_some()) {
            let parent_hash = parent_opt.value_unchecked();
            this.children_map.get(parent_hash).value_unchecked().push(hash);
        }
    }
    depth_first_hashes() {
        let output = new List();
        if (this.root_hash.is_some()) {
            let root_hash = this.root_hash.value_unchecked();
            this.depth_first_keys_rec(root_hash, output);
        }
        return output;
    }
    depth_first_keys_rec(hash, output) {
        output.push(hash);
        let children = this.children_map.get(hash).value_unchecked();
        for (let child_hash of children.iter()) {
            this.depth_first_keys_rec(child_hash, output);
        }
    }
    remove_rec(hash) {
        let children = this.children_map.get(hash).value_or_throw();
        for (let child of children.iter()) {
            this.remove_rec(child);
        }
        this.value_map.remove(hash);
        this.parent_map.remove(hash);
        this.children_map.remove(hash);
    }
}

class MultiHashTree {
    trees;
    constructor() {
        this.trees = new List();
    }
    get(hash) {
        for (let tree of this.trees.iter()) {
            if (tree.contains(hash)) {
                return tree.get(hash);
            }
        }
        return Opt.none();
    }
    get_item(hash) {
        for (let tree of this.trees.iter()) {
            if (tree.contains(hash)) {
                return tree.get_item(hash);
            }
        }
        return Opt.none();
    }
    contains(hash) {
        for (let tree of this.trees.iter()) {
            if (tree.contains(hash)) {
                return true;
            }
        }
        return false;
    }
    remove(hash) {
        for (let tree of this.trees.iter()) {
            if (tree.contains(hash)) {
                tree.remove(hash);
            }
        }
    }
    insert(hash, parent_opt, value) {
        if (parent_opt.is_none()) {
            let tree = new HashTree();
            tree.insert(hash, Opt.none(), value);
            this.trees.push(tree);
        }
        else {
            let parent_hash = parent_opt.value_unchecked();
            for (let tree of this.trees.iter()) {
                if (tree.contains(parent_hash)) {
                    tree.insert(hash, parent_opt, value);
                }
            }
        }
    }
    depth_first_hashes() {
        let output = new List();
        for (let tree of this.trees.iter()) {
            output.append(tree.depth_first_hashes());
        }
        return output;
    }
}

var DateExtensions;
(function (DateExtensions) {
    function load() { }
    DateExtensions.load = load;
})(DateExtensions || (DateExtensions = {}));

var NumberExtensions;
(function (NumberExtensions) {
    function load() { }
    NumberExtensions.load = load;
})(NumberExtensions || (NumberExtensions = {}));
Number.prototype.min = function (other) {
    return Math.min(this, other);
};
Number.prototype.max = function (other) {
    return Math.max(this, other);
};
Number.prototype.abs = function () {
    return Math.abs(this);
};
Number.prototype.sqrt = function () {
    return Math.sqrt(this);
};

var StringExtensions;
(function (StringExtensions) {
    function load() { }
    StringExtensions.load = load;
})(StringExtensions || (StringExtensions = {}));
String.prototype.parse_json = function () {
    return JSON.parse(this);
};
String.prototype.parse_int = function () {
    return parseInt(this);
};
String.prototype.parse_float = function () {
    return parseFloat(this);
};
String.prototype.parse_number = function () {
    return Number(this);
};
String.prototype.parse_number_or = function (if_nan) {
    let parsed = Number(this);
    if (isNaN(parsed)) {
        parsed = if_nan;
    }
    return parsed;
};
String.prototype.to_number_or = function (or_value) {
    try {
        let parsed = Number(this);
        return isNaN(parsed) ? or_value : parsed;
    }
    catch {
        return or_value;
    }
};
String.prototype.encode_uri_component = function () {
    return encodeURIComponent(this);
};
String.prototype.decode_uri_component = function () {
    return decodeURIComponent(this);
};
String.prototype.is_whitespace = function () {
    return /\s/.test(this);
};
String.prototype.is_newline = function () {
    return /\n/.test(this);
};
String.prototype.is_digit = function () {
    const char_code = this.charCodeAt(0);
    return char_code >= 48 && char_code <= 57;
};
String.prototype.is_letter = function () {
    const char_code = this.charCodeAt(0);
    return (char_code >= 65 && char_code <= 90) || (char_code >= 97 && char_code <= 122);
};
String.prototype.is_alphanumeric = function () {
    return this.is_digit() || this.is_letter();
};

var CoreExtensions;
(function (CoreExtensions) {
    function load() {
        DateExtensions.load();
        NumberExtensions.load();
        StringExtensions.load();
    }
    CoreExtensions.load = load;
})(CoreExtensions || (CoreExtensions = {}));

class IdGen {
    counter;
    constructor(start_at) {
        this.counter = start_at;
    }
    next() {
        this.counter += 1;
        return this.counter;
    }
}

class Color {
    r;
    g;
    b;
    a;
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static parse_hex_string(hex_string) {
        // Remove the hash at the start if it's there
        let hex = hex_string.replace(/^#/, '');
        // Parse the hex string
        let r, g, b;
        if (hex.length === 6) {
            // If 6 characters, split into pairs and parse as integers
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        }
        else if (hex.length === 3) {
            // If 3 characters, treat it as shorthand (e.g., #ABC -> #AABBCC)
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        }
        else {
            throw new Error("Invalid hex color format");
        }
        return new Color(r, g, b, 1.0);
    }
    with_alpha(alpha) {
        return new Color(this.r, this.g, this.b, alpha);
    }
    mix(pct, other) {
        let r = (pct * this.r) + ((1 - pct) * other.r);
        let g = (pct * this.g) + ((1 - pct) * other.g);
        let b = (pct * this.b) + ((1 - pct) * other.b);
        return new Color(r, g, b, this.a);
    }
    rgba_string() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}

function exaustive_switch(_) {
    throw new Error("Didn't expect to get here");
}

var Log;
(function (Log) {
    function json(x, n) {
        let shift = n ?? 2;
        console.log(JSON.stringify(x, null, shift));
    }
    Log.json = json;
})(Log || (Log = {}));

var PathUtils;
(function (PathUtils) {
    function remove_last_extension(filename) {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return filename; // Return the filename as is if there's no dot
        }
        return filename.substring(0, lastDotIndex);
    }
    PathUtils.remove_last_extension = remove_last_extension;
})(PathUtils || (PathUtils = {}));

function sleep(time_ms) {
    return new Promise((res, rej) => {
        setTimeout(() => res(), time_ms);
    });
}

class PromiseScheduler {
    static SLEEP_MS = 1000.0 / 60.0;
    static async run(n_simultanious_jobs, jobs) {
        let scheduler = new PromiseScheduler(n_simultanious_jobs, jobs);
        await scheduler.run();
    }
    n_simultanious_jobs;
    jobs;
    active_jobs;
    current_job_index;
    finished_jobs;
    constructor(n_simultanious_jobs, jobs) {
        this.n_simultanious_jobs = n_simultanious_jobs.min(jobs.len());
        this.jobs = jobs;
        this.active_jobs = new HashMap();
        this.current_job_index = 0;
        this.finished_jobs = 0;
    }
    async run() {
        if (this.jobs.len() === 0) {
            return;
        }
        while (this.finished_jobs < this.jobs.len()) {
            this.clear_finished_jobs();
            if (this.finished_jobs === this.jobs.len()) {
                return;
            }
            if (this.active_jobs.len() < this.n_simultanious_jobs) {
                this.push_next_job();
            }
            await sleep(PromiseScheduler.SLEEP_MS);
        }
    }
    clear_finished_jobs() {
        let keys_that_ended = new List();
        for (let entry of this.active_jobs.to_list().iter()) {
            if (entry.value.is_done()) {
                keys_that_ended.push(entry.hash);
            }
        }
        for (let key_that_ended of keys_that_ended.iter()) {
            this.active_jobs.remove(key_that_ended);
            this.finished_jobs += 1;
        }
    }
    push_next_job() {
        if (this.jobs.is_valid_index(this.current_job_index) === false)
            return;
        let job_to_add = this.jobs.get(this.current_job_index);
        this.active_jobs.insert(this.current_job_index.toString(), job_to_add);
        job_to_add.start();
        this.current_job_index += 1;
    }
}

class SimplePromiseSchedulerJob {
    action;
    isDone = false;
    constructor(action) {
        this.action = action;
    }
    start() {
        this.run();
    }
    is_done() {
        return this.isDone;
    }
    async run() {
        await this.action();
        this.isDone = true;
    }
}
var SimplePromiseScheduler;
(function (SimplePromiseScheduler) {
    async function run_jobs(nJobs, actionList) {
        await PromiseScheduler.run(nJobs, actionList.map(action => new SimplePromiseSchedulerJob(action)));
    }
    SimplePromiseScheduler.run_jobs = run_jobs;
})(SimplePromiseScheduler || (SimplePromiseScheduler = {}));

var Random;
(function (Random) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    function str(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }
    Random.str = str;
})(Random || (Random = {}));

class Result {
    _is_ok;
    value;
    error;
    constructor() {
        this._is_ok = false;
        this.value = null;
        this.error = null;
    }
    static error(error) {
        let to_return = new Result();
        to_return._is_ok = false;
        to_return.value = null;
        to_return.error = error;
        return to_return;
    }
    static ok(value) {
        let to_return = new Result();
        to_return._is_ok = true;
        to_return.value = value;
        to_return.error = null;
        return to_return;
    }
    is_ok() { return this._is_ok; }
    is_error() { return this.is_ok() === false; }
    get_value() {
        if (this.is_error())
            throw new Error();
        return this.value;
    }
    get_error() {
        if (this.is_ok())
            throw new Error();
        return this.error;
    }
    value_or_throw() {
        if (this.is_error())
            throw new Error();
        return this.value;
    }
}

class UniqueHashGenerator {
    hash_set;
    constructor() {
        this.hash_set = new HashSet();
    }
    _next(size) {
        let next = Random.str(size);
        while (this.hash_set.contains(next)) {
            next = Random.str(size);
        }
        this.hash_set.insert(next);
        return next;
    }
    _remove(hash) {
        this.hash_set.remove(hash);
    }
    _add_hash(hash) {
        this.hash_set.insert(hash);
    }
}

class WebWorker {
    worker;
    constructor(worker) {
        this.worker = worker;
    }
    static from_uri(url_or_src) {
        let worker = new Worker(url_or_src);
        return new WebWorker(worker);
    }
    run(input) {
        return new Promise((res, rej) => {
            this.worker.onmessage = (r) => {
                res({});
            };
            this.worker.onerror = (r) => {
                rej();
            };
            this.worker.onmessageerror = (r) => {
                rej();
            };
            this.worker.postMessage(input);
        });
    }
}

export { Color, CoreExtensions, DateExtensions, HashMap, HashSet, HashTree, IdGen, List, Log, MultiHashTree, NumberExtensions, Opt, PathUtils, PromiseScheduler, Random, Result, SimplePromiseScheduler, StringExtensions, UniqueHashGenerator, WebWorker, exaustive_switch, sleep };
