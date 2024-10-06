declare class Opt<T> {
    private hasValue;
    private value;
    private constructor();
    static none<T>(): Opt<T>;
    static some<T>(value: T): Opt<T>;
    static of_value_or_null<T>(value: T | null): Opt<T>;
    is_none(): boolean;
    is_some(): boolean;
    unwrap(): T | null;
    value_or<G>(t: G): T | G;
    value_or_throw(): T;
    value_unchecked(): T;
    do_if_some<G>(fn: (t: T) => G): void;
    do_if_some_async<G>(fn: (t: T) => Promise<G>): Promise<G | undefined>;
    do<G>(filledAction: (t: T) => G, emptyAction: () => G): G;
    do_async<G>(filledAction: (t: T) => Promise<G>, emptyAction: () => Promise<G>): Promise<G>;
    transform<G>(action: (t: T) => G): Opt<G>;
}

declare class HashSet {
    private innerSet;
    constructor();
    size(): number;
    contains(str: string): boolean;
    _add(str: string): void;
    _remove(str: string): void;
    to_list(): List<string>;
}

declare class List<T> {
    private inner_array;
    constructor();
    static of<T>(array: T[]): List<T>;
    clone(inner_clone: (item: T) => T): List<T>;
    clear(): void;
    get_array(): T[];
    len(): number;
    is_valid_index(index: number): boolean;
    last_index(): number;
    get(index: number): T;
    get_last(): Opt<T>;
    get_last_many(amount: number, order: "ascending" | "descending"): List<T>;
    set(index: number, item: T): void;
    _push(item: T): void;
    _push_all(list: List<T>): void;
    _remove(index: number): void;
    _pop(): Opt<T>;
    _swap(index_a: number, index_b: number): void;
    _swap_pop(index: number): Opt<T>;
    _splice(start: number, end: number): List<T>;
    iter(): Generator<T>;
    enumerate(): Generator<{
        index: number;
        value: T;
    }>;
    map<G>(mapFn: (item: T, index: number) => G): List<G>;
    map_async_all<G>(mapFn: (item: T, index: number) => Promise<G>): Promise<List<G>>;
    to_hash_set(strFn: (x: T) => string): HashSet;
    filter(fn: (item: T, index: number) => boolean): List<T>;
    filter_map<G>(filter: (item: T, index: number) => boolean, map: (item: T, index: number) => G): List<G>;
    for_each(fn: (item: T, index: number) => void): void;
    /**
     * sorts inplace
     */
    _sort(comparison: (a: T, b: T) => number): List<T>;
    /**
     * sorts inplace
     */
    _sort_by_str(fn: (item: T) => string): List<T>;
    /**
     * sorts inplace
     */
    _sort_by_number(fn: (item: T) => number): List<T>;
    to_hash_map(hashFn: (t: T) => string): HashMap<T>;
    group_by(groupHashFn: (item: T) => string): HashMap<List<T>>;
    zip<G>(other: List<G>): List<{
        left: T;
        right: Opt<G>;
    }>;
    find_first(conditionFn: (t: T) => boolean): Opt<T>;
    find_first_with_index(conditionFn: (t: T) => boolean): Opt<[T, number]>;
    aggregate<G>(g: G, agregation: (g: G, t: T) => G): G;
    max(comp_fn: (a: T, b: T) => -1 | 0 | 1): Opt<T>;
    max_by_number(fn: (a: T) => number): Opt<T>;
    min(comp_fn: (a: T, b: T) => -1 | 0 | 1): Opt<T>;
    min_by_number(fn: (a: T) => number): Opt<T>;
}

declare class HashMap<T> {
    private size_;
    private innerMap;
    constructor();
    static of<T>(obj: Record<string, T | undefined>): HashMap<T>;
    clone(clone_inner: (t: T) => T): HashMap<T>;
    size(): number;
    get_inner_map(): Record<string, T | undefined>;
    contains(hash: string): boolean;
    get(hash: string): Opt<T>;
    get_unchecked(hash: string): T;
    _put(hash: string, value: T): void;
    _remove(hash: string): void;
    iter(): Generator<{
        hash: string;
        value: T;
    }>;
    iter_values(): Generator<T>;
    for_each(action: (value: T, hash: string) => void): void;
    entries(): List<{
        hash: string;
        value: T;
    }>;
    keys(): List<string>;
    gen_available_random_key(key_len: number): string;
    transform<U>(transformFn: (t: T) => U): HashMap<U>;
}

declare class TreeHashMap<T> {
    private root;
    private value_map;
    private parent_map;
    private children_map;
    constructor();
    contains(key: string): boolean;
    get_value(key: string): Opt<T>;
    get_parent_key(key: string): Opt<string>;
    get_root_hash(): Opt<string>;
    _remove(key: string): void;
    _put(key: string, value: T, parent: Opt<string>): void;
    list_keys(): List<string>;
    list_level_ordered(order: (a: T, b: T) => number): List<{
        hash: string;
        lv: number;
    }>;
    list_level_ordered_from(key: string, order: (a: T, b: T) => number, lv: number): List<{
        hash: string;
        lv: number;
    }>;
    list_children(key: string): List<{
        key: string;
        value: T;
    }>;
    list_children_recursive(key: string): List<{
        key: string;
        value: T;
    }>;
    list_subtree(key: string): List<{
        key: string;
        value: T;
    }>;
    list_parents(key: string): List<string>;
    find_first_parent_such_that(key: string, criterion: (key: string, value: T) => boolean): Opt<{
        display_key: string;
        value: T;
    }>;
    iter_breadth(display_key: Opt<string>): Generator<{
        key: string;
        value: T;
    }>;
    private list_children_recursive_;
    private list_level_ordered_from_;
}

declare class TreeHashMapMulti<T> {
    private roots;
    constructor();
    contains(key: string): boolean;
    get_value(key: string): Opt<T>;
    get_parent_key(key: string): Opt<string>;
    _remove(key: string): void;
    _put(key: string, value: T, parent_opt: Opt<string>): void;
    list_keys(): List<string>;
    list_level_ordered(order: (a: T, b: T) => number): List<{
        hash: string;
        lv: number;
    }>;
    list_level_ordered_from(key: string, order: (a: T, b: T) => number): List<unknown>;
    list_children(key: string): List<{
        key: string;
        value: T;
    }>;
    list_children_recursive(key: string): List<{
        key: string;
        value: T;
    }>;
    list_subtree(key: string): List<{
        key: string;
        value: T;
    }>;
    list_parents(key: string): List<string>;
    find_first_parent_such_that(key: string, criterion: (key: string, value: T) => boolean): Opt<{
        display_key: string;
        value: T;
    }>;
    iter_breadth(start_key_opt: Opt<string>): Generator<{
        key: string;
        value: T;
    }>;
}

declare namespace CoreExtensions {
    function load(): void;
}

declare namespace DateExtensions {
    function load(): void;
}
declare global {
}

declare namespace NumberExtensions {
    function load(): void;
}
declare global {
    interface Number {
        tol_equals(other: number): boolean;
        delta_equals(other: number, delta: number): boolean;
        min(other: number): number;
        max(other: number): number;
        abs(): number;
        sqrt(): number;
        to_px(): number;
        to_cm(): number;
    }
}

declare namespace StringExtensions {
    function load(): void;
}
declare global {
    interface String {
        parse_json<T>(): T;
        parse_int(): number;
        parse_float(): number;
        parse_number(): number;
        parse_number_or(if_nan: number): number;
        to_number_or(or_value: number): number;
        encode_uri_component(): string;
        decode_uri_component(): string;
        is_whitespace(): boolean;
        is_newline(): boolean;
    }
}

declare class IdGen {
    private counter;
    constructor(start_at: number);
    _next(): number;
}

declare function exaustive_switch(_: never): never;

declare namespace PathUtils {
    function remove_last_extension(filename: string): string;
}

interface IPromiseSchedulerJob {
    start(): void;
    is_done(): boolean;
}
declare class PromiseScheduler<Job extends IPromiseSchedulerJob> {
    private static readonly SLEEP_MS;
    static run<Job extends IPromiseSchedulerJob>(n_simultanious_jobs: number, jobs: List<Job>): Promise<void>;
    private n_simultanious_jobs;
    private jobs;
    private active_jobs;
    private current_job_index;
    private finished_jobs;
    constructor(n_simultanious_jobs: number, jobs: List<Job>);
    private run;
    private clear_finished_jobs;
    private push_next_job;
}

declare namespace SimplePromiseScheduler {
    function run_jobs(nJobs: number, actionList: List<() => Promise<void>>): Promise<void>;
}

declare namespace Random {
    function str(length: number): string;
}

declare class Result<T, E> {
    private _is_ok;
    private value;
    private error;
    private constructor();
    static error<T, E>(error: E): Result<T, E>;
    static ok<T, E>(value: T): Result<T, E>;
    is_ok(): boolean;
    is_error(): boolean;
    get_value(): T;
    get_error(): E;
    value_or_throw(): T;
}

declare function sleep(time_ms: number): Promise<void>;

declare class UniqueHashGenerator {
    private hash_set;
    constructor();
    _next(size: number): string;
    _remove(hash: string): void;
    _add_hash(hash: string): void;
}

declare class WebWorker<Input, Output> {
    private worker;
    constructor(worker: Worker);
    static from_uri(url_or_src: string): WebWorker<unknown, unknown>;
    run(input: Input): Promise<Output>;
}

export { CoreExtensions, DateExtensions, HashMap, HashSet, type IPromiseSchedulerJob, IdGen, List, NumberExtensions, Opt, PathUtils, PromiseScheduler, Random, Result, SimplePromiseScheduler, StringExtensions, TreeHashMap, TreeHashMapMulti, UniqueHashGenerator, WebWorker, exaustive_switch, sleep };
