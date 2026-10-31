/* @ts-self-types="./mixo_geometry_wasm.d.ts" */

class AsciiStlSession {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AsciiStlSessionFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_asciistlsession_free(ptr, 0);
    }
    /**
     * @returns {WeldResult}
     */
    finish() {
        const ret = wasm.asciistlsession_finish(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WeldResult.__wrap(ret[0]);
    }
    /**
     * @param {number} file_size
     */
    constructor(file_size) {
        const ret = wasm.asciistlsession_new(file_size);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        AsciiStlSessionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {Uint8Array} chunk
     */
    push(chunk) {
        const ptr0 = passArray8ToWasm0(chunk, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.asciistlsession_push(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
}
if (Symbol.dispose) AsciiStlSession.prototype[Symbol.dispose] = AsciiStlSession.prototype.free;
exports.AsciiStlSession = AsciiStlSession;

class BinaryStlSession {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BinaryStlSessionFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_binarystlsession_free(ptr, 0);
    }
    /**
     * @returns {WeldResult}
     */
    finish() {
        const ret = wasm.binarystlsession_finish(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WeldResult.__wrap(ret[0]);
    }
    /**
     * @param {number} triangles
     */
    constructor(triangles) {
        const ret = wasm.binarystlsession_new(triangles);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        BinaryStlSessionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {Uint8Array} chunk
     */
    push(chunk) {
        const ptr0 = passArray8ToWasm0(chunk, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.binarystlsession_push(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
}
if (Symbol.dispose) BinaryStlSession.prototype[Symbol.dispose] = BinaryStlSession.prototype.free;
exports.BinaryStlSession = BinaryStlSession;

class BodySegmentsResult {
    static __wrap(ptr) {
        const obj = Object.create(BodySegmentsResult.prototype);
        obj.__wbg_ptr = ptr;
        BodySegmentsResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BodySegmentsResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bodysegmentsresult_free(ptr, 0);
    }
    /**
     * @returns {Uint32Array}
     */
    take_first() {
        const ret = wasm.bodysegmentsresult_take_first(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_keys() {
        const ret = wasm.bodysegmentsresult_take_keys(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float32Array}
     */
    take_points() {
        const ret = wasm.bodysegmentsresult_take_points(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) BodySegmentsResult.prototype[Symbol.dispose] = BodySegmentsResult.prototype.free;
exports.BodySegmentsResult = BodySegmentsResult;

/**
 * Diagnostic strips on both sides of each contour; `ok()` false carries the reason.
 */
class DentalBandsResult {
    static __wrap(ptr) {
        const obj = Object.create(DentalBandsResult.prototype);
        obj.__wbg_ptr = ptr;
        DentalBandsResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DentalBandsResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dentalbandsresult_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    ok() {
        const ret = wasm.dentalbandsresult_ok(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    reason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.dentalbandsresult_reason(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * One band mask (1 byte per face): 0 outer opening side, 1 outer other side, 2 inner opening side, 3 inner other side.
     * @param {number} index
     * @returns {Uint8Array}
     */
    take_band(index) {
        const ret = wasm.dentalbandsresult_take_band(this.__wbg_ptr, index);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) DentalBandsResult.prototype[Symbol.dispose] = DentalBandsResult.prototype.free;
exports.DentalBandsResult = DentalBandsResult;

/**
 * Central opening of a closed mesh for a known rim frame. `kind()` 0 present, 1 absent, 2 ambiguous.
 */
class DentalOpeningResult {
    static __wrap(ptr) {
        const obj = Object.create(DentalOpeningResult.prototype);
        obj.__wbg_ptr = ptr;
        DentalOpeningResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DentalOpeningResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dentalopeningresult_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    kind() {
        const ret = wasm.dentalopeningresult_kind(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {string}
     */
    reason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.dentalopeningresult_reason(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Opening loop as vertex pairs sorted by edge key.
     * @returns {Uint32Array}
     */
    take_edges() {
        const ret = wasm.dentalopeningresult_take_edges(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) DentalOpeningResult.prototype[Symbol.dispose] = DentalOpeningResult.prototype.free;
exports.DentalOpeningResult = DentalOpeningResult;

/**
 * Step 1 result. Failed: `status() == 1` with `reason()`. Oriented: `status() == 0`.
 */
class DentalOrientResult {
    static __wrap(ptr) {
        const obj = Object.create(DentalOrientResult.prototype);
        obj.__wbg_ptr = ptr;
        DentalOrientResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DentalOrientResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dentalorientresult_free(ptr, 0);
    }
    /**
     * What the trim found (engine 13, `dental::trim`): 0 open arch (the trim plane and its U ends
     * decided up and front), 1 ring (a U bridged by a plate; the floor rule decided), 2 not oriented.
     * @returns {number}
     */
    arch_kind() {
        const ret = wasm.dentalorientresult_arch_kind(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Whether the rule that did not decide agrees on up/down: 0 agrees, 1 inconclusive, 2 disagrees
     * (the host reports a disagreement as needing a look; nothing resolves it silently).
     * @returns {number}
     */
    cross_check() {
        const ret = wasm.dentalorientresult_cross_check(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * confidence, floor offset ratio (how far the axis-facing floor leans toward one end), axial variance ratio.
     * @returns {Float64Array}
     */
    diagnostics() {
        const ret = wasm.dentalorientresult_diagnostics(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * False when the opening found contradicts the profile's expectation (Step 1 mismatch notice).
     * @returns {boolean}
     */
    matches_profile() {
        const ret = wasm.dentalorientresult_matches_profile(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    mesh_ok() {
        const ret = wasm.dentalorientresult_mesh_ok(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * 0 present, 1 absent, 2 ambiguous.
     * @returns {number}
     */
    opening() {
        const ret = wasm.dentalorientresult_opening(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Failure reason, or why the central opening is ambiguous (empty otherwise).
     * @returns {string}
     */
    reason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.dentalorientresult_reason(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * kind (0 lower-edge loop, 1 projection fallback), opening direction, centroid, tangent,
     * bitangent (3 each), visibility resolution, visibility min (2), visibility max (2), whether the
     * trim's U decided a front (0/1), that front (3; zeros without one).
     * @returns {Float64Array}
     */
    rim_scalars() {
        const ret = wasm.dentalorientresult_rim_scalars(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Euler XYZ radians, or empty when the arch front is ambiguous.
     * @returns {Float64Array}
     */
    rotation() {
        const ret = wasm.dentalorientresult_rotation(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {number}
     */
    status() {
        const ret = wasm.dentalorientresult_status(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {Float32Array}
     */
    take_rim_points() {
        const ret = wasm.dentalorientresult_take_rim_points(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    take_visibility_mask() {
        const ret = wasm.dentalorientresult_take_visibility_mask(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) DentalOrientResult.prototype[Symbol.dispose] = DentalOrientResult.prototype.free;
exports.DentalOrientResult = DentalOrientResult;

/**
 * A detected region: contours, face cut, contact strip and contacts (Step 2 display and review;
 * the policy itself is `dental_policy`).
 */
class DentalRegionResult {
    static __wrap(ptr) {
        const obj = Object.create(DentalRegionResult.prototype);
        obj.__wbg_ptr = ptr;
        DentalRegionResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DentalRegionResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dentalregionresult_free(ptr, 0);
    }
    /**
     * @returns {Float64Array}
     */
    connector_lengths() {
        const ret = wasm.dentalregionresult_connector_lengths(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Distance along the contour then distance from it, per contact.
     * @returns {Float64Array}
     */
    contact_distances() {
        const ret = wasm.dentalregionresult_contact_distances(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Source face per contact: outer-rim contacts first, then opening-rim contacts.
     * @returns {Uint32Array}
     */
    contact_faces_of() {
        const ret = wasm.dentalregionresult_contact_faces_of(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Position XYZ then normal XYZ per contact.
     * @returns {Float64Array}
     */
    contact_points() {
        const ret = wasm.dentalregionresult_contact_points(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * 0 outer rim, 1 opening rim, per contact.
     * @returns {Uint8Array}
     */
    contact_rims() {
        const ret = wasm.dentalregionresult_contact_rims(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {boolean}
     */
    ok() {
        const ret = wasm.dentalregionresult_ok(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    reason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.dentalregionresult_reason(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Faces on the opening-facing side, then on the other side.
     * @returns {Uint32Array}
     */
    region_faces() {
        const ret = wasm.dentalregionresult_region_faces(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    take_allowed_faces() {
        const ret = wasm.dentalregionresult_take_allowed_faces(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * The contact strip (1 byte per face).
     * @returns {Uint8Array}
     */
    take_contact_faces() {
        const ret = wasm.dentalregionresult_take_contact_faces(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_opening_edges() {
        const ret = wasm.dentalregionresult_take_opening_edges(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_outer_connector_edges() {
        const ret = wasm.dentalregionresult_take_outer_connector_edges(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_outer_edges() {
        const ret = wasm.dentalregionresult_take_outer_edges(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_outer_ridge_edges() {
        const ret = wasm.dentalregionresult_take_outer_ridge_edges(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) DentalRegionResult.prototype[Symbol.dispose] = DentalRegionResult.prototype.free;
exports.DentalRegionResult = DentalRegionResult;

/**
 * Arclength contact samples on one contour side band.
 */
class DentalSampleResult {
    static __wrap(ptr) {
        const obj = Object.create(DentalSampleResult.prototype);
        obj.__wbg_ptr = ptr;
        DentalSampleResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DentalSampleResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dentalsampleresult_free(ptr, 0);
    }
    /**
     * Distance along the contour then distance from it, per contact.
     * @returns {Float64Array}
     */
    distances() {
        const ret = wasm.dentalsampleresult_distances(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    faces() {
        const ret = wasm.dentalsampleresult_faces(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {boolean}
     */
    ok() {
        const ret = wasm.dentalsampleresult_ok(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    perimeter() {
        const ret = wasm.dentalsampleresult_perimeter(this.__wbg_ptr);
        return ret;
    }
    /**
     * Position XYZ then normal XYZ per contact.
     * @returns {Float64Array}
     */
    points() {
        const ret = wasm.dentalsampleresult_points(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {string}
     */
    reason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.dentalsampleresult_reason(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    skipped_samples() {
        const ret = wasm.dentalsampleresult_skipped_samples(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) DentalSampleResult.prototype[Symbol.dispose] = DentalSampleResult.prototype.free;
exports.DentalSampleResult = DentalSampleResult;

/**
 * The print-angle search (`dental_tilt_scan`): one row per scanned tilt in step order, the pick
 * order (the pick first), the pick's reason and the stable band. Failed: `ok() == false` with `reason()`.
 */
class DentalTiltScanResult {
    static __wrap(ptr) {
        const obj = Object.create(DentalTiltScanResult.prototype);
        obj.__wbg_ptr = ptr;
        DentalTiltScanResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DentalTiltScanResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dentaltiltscanresult_free(ptr, 0);
    }
    /**
     * First and last row index of the stable band, or empty.
     * @returns {Uint32Array}
     */
    band() {
        const ret = wasm.dentaltiltscanresult_band(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Denture scan: per row, how many lowest points no support can reach at that tilt; empty for the aligner scan or with the rule off.
     * @returns {Uint32Array}
     */
    boxed_counts() {
        const ret = wasm.dentaltiltscanresult_boxed_counts(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Denture scan: the picked row's boxed-in lowest points, x y z each (mesh frame, mm).
     * @returns {Float64Array}
     */
    boxed_points() {
        const ret = wasm.dentaltiltscanresult_boxed_points(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Denture scan: why each of `boxed_points()` is boxed in, same order.
     * @returns {string[]}
     */
    boxed_reasons() {
        const ret = wasm.dentaltiltscanresult_boxed_reasons(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Per row and rule (4 per row): the first failing vertex id (resin trap) or tip id, or "".
     * @returns {string[]}
     */
    failing() {
        const ret = wasm.dentaltiltscanresult_failing(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {boolean}
     */
    ok() {
        const ret = wasm.dentaltiltscanresult_ok(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Row indices in pick order: the pick, then the tilts the confirm tries next.
     * @returns {Uint32Array}
     */
    order() {
        const ret = wasm.dentaltiltscanresult_order(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * 0 robust, 1 passing (no tilt is robust), 2 failing (no tilt passes).
     * @returns {number}
     */
    pick_reason() {
        const ret = wasm.dentaltiltscanresult_pick_reason(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {string}
     */
    reason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.dentaltiltscanresult_reason(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Per row, 12 numbers: tilt (degrees), steps from the start, rule flags (bit 0 resin trap, 1 rim
     * gap, 2 crossing, 3 too thin), fitting-side tips, largest gap mm, largest slenderness, largest
     * layer mm², height mm, robust (0/1), rotation Euler XYZ radians (3, as the orient result).
     * @returns {Float64Array}
     */
    rows() {
        const ret = wasm.dentaltiltscanresult_rows(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * The start tilt (degrees).
     * @returns {number}
     */
    start_deg() {
        const ret = wasm.dentaltiltscanresult_start_deg(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) DentalTiltScanResult.prototype[Symbol.dispose] = DentalTiltScanResult.prototype.free;
exports.DentalTiltScanResult = DentalTiltScanResult;

/**
 * Support-area comparison: per-face classes and the three areas (mm^2).
 */
class DentureAreaResult {
    static __wrap(ptr) {
        const obj = Object.create(DentureAreaResult.prototype);
        obj.__wbg_ptr = ptr;
        DentureAreaResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DentureAreaResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_denturearearesult_free(ptr, 0);
    }
    /**
     * Owner area, generated area, area in both (mm^2).
     * @returns {Float64Array}
     */
    areas() {
        const ret = wasm.denturearearesult_areas(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Per face: 0 neither, 1 owner only, 2 generated only, 3 both.
     * @returns {Uint8Array}
     */
    mask() {
        const ret = wasm.denturearearesult_mask(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) DentureAreaResult.prototype[Symbol.dispose] = DentureAreaResult.prototype.free;
exports.DentureAreaResult = DentureAreaResult;

/**
 * Step 1 result for a denture. Failed: `status() == 1` with `reason()`. Oriented: `status() == 0`.
 */
class DentureOrientResult {
    static __wrap(ptr) {
        const obj = Object.create(DentureOrientResult.prototype);
        obj.__wbg_ptr = ptr;
        DentureOrientResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DentureOrientResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dentureorientresult_free(ptr, 0);
    }
    /**
     * flatness (smallest / largest covariance eigenvalue), legs gap ratio, teeth offset mm.
     * @returns {Float64Array}
     */
    diagnostics() {
        const ret = wasm.dentureorientresult_diagnostics(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * The arch frame: centroid, up (apex direction), teeth side, across (3 each); empty when failed.
     * @returns {Float64Array}
     */
    frame() {
        const ret = wasm.dentureorientresult_frame(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Failure reason (`too-few-vertices`, `no-arch-plane`, `no-legs`, `both-ends-split`), empty when oriented.
     * @returns {string}
     */
    reason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.dentureorientresult_reason(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Euler XYZ radians turning the mesh upright (tilt 0); empty when failed.
     * @returns {Float64Array}
     */
    rotation() {
        const ret = wasm.dentureorientresult_rotation(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {number}
     */
    status() {
        const ret = wasm.dentureorientresult_status(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * False when the teeth side's lean was below the profile's minimum (a side was still taken;
     * the host reports it as needing a look).
     * @returns {boolean}
     */
    teeth_decided() {
        const ret = wasm.dentureorientresult_teeth_decided(this.__wbg_ptr);
        return ret !== 0;
    }
}
if (Symbol.dispose) DentureOrientResult.prototype[Symbol.dispose] = DentureOrientResult.prototype.free;
exports.DentureOrientResult = DentureOrientResult;

/**
 * The review layers of the owner denture rules, flat numbers in the mesh frame (mm).
 */
class DentureReviewResult {
    static __wrap(ptr) {
        const obj = Object.create(DentureReviewResult.prototype);
        obj.__wbg_ptr = ptr;
        DentureReviewResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DentureReviewResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_denturereviewresult_free(ptr, 0);
    }
    /**
     * Step 2, per face: 1 when a ray from the back origin reaches it first (ALLOWED; overrides no-support; tips stand only here), else 0.
     * @returns {Uint8Array}
     */
    allowed_mask() {
        const ret = wasm.denturereviewresult_allowed_mask(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Tight box: centre (3, the line-of-sight point), axes (9), half extents (3).
     * @returns {Float64Array}
     */
    box_() {
        const ret = wasm.denturereviewresult_box_(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Length (mm) of each chain.
     * @returns {Float64Array}
     */
    chain_lengths() {
        const ret = wasm.denturereviewresult_chain_lengths(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * The continuous down-edge chains: `x y z` per point, chains back to back (sizes in `chain_sizes`).
     * @returns {Float64Array}
     */
    chain_points() {
        const ret = wasm.denturereviewresult_chain_points(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Point count of each chain.
     * @returns {Uint32Array}
     */
    chain_sizes() {
        const ret = wasm.denturereviewresult_chain_sizes(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * The hard edges that face down in the oriented pose (before the print tilt), same layout.
     * @returns {Float64Array}
     */
    down_edges() {
        const ret = wasm.denturereviewresult_down_edges(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Overhang candidates, per face: 1 when within 60 degrees of straight down for the reviewed plate normal.
     * @returns {Uint8Array}
     */
    down_mask() {
        const ret = wasm.denturereviewresult_down_mask(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Every hard edge as segments `ax ay az bx by bz`.
     * @returns {Float64Array}
     */
    hard_edges() {
        const ret = wasm.denturereviewresult_hard_edges(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Per face: 1 within 5 mm along the surface of a hole (support-allowed).
     * @returns {Uint8Array}
     */
    hole_band_mask() {
        const ret = wasm.denturereviewresult_hole_band_mask(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Per hole: area (mm2), faces next to it.
     * @returns {Float64Array}
     */
    hole_info() {
        const ret = wasm.denturereviewresult_hole_info(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * The hole outlines (hit points around each hole seen along the teeth axis), `x y z` points back to back.
     * @returns {Float64Array}
     */
    hole_outlines() {
        const ret = wasm.denturereviewresult_hole_outlines(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Point count of each hole outline.
     * @returns {Uint32Array}
     */
    hole_sizes() {
        const ret = wasm.denturereviewresult_hole_sizes(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * The islands of the reviewed pose, 9 numbers each (layout as `PolicyHandle::island_facts`; the serving tip index counts into `tips`). Empty with the rule `islandTips` off.
     * @returns {Float64Array}
     */
    islands() {
        const ret = wasm.denturereviewresult_islands(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Why the islands could not be told; empty when they could.
     * @returns {string}
     */
    islands_note() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.denturereviewresult_islands_note(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Low points that got a tip (xyz each).
     * @returns {Float64Array}
     */
    low_tip_points() {
        const ret = wasm.denturereviewresult_low_tip_points(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Per low tip: 0 allowed, 1 outside the no-support zone, 2 within lowRimBandMm of the rim, 3 anywhere (lowOutsideAllowed 2).
     * @returns {Uint8Array}
     */
    low_tip_reasons() {
        const ret = wasm.denturereviewresult_low_tip_reasons(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Low points outside the allowed area (left unsupported), `x y z` each.
     * @returns {Float64Array}
     */
    lows_outside() {
        const ret = wasm.denturereviewresult_lows_outside(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * The face of each `lows_outside` point.
     * @returns {Uint32Array}
     */
    lows_outside_faces() {
        const ret = wasm.denturereviewresult_lows_outside_faces(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Allowed low points no tip reaches, `x y z` each.
     * @returns {Float64Array}
     */
    lows_unreached() {
        const ret = wasm.denturereviewresult_lows_unreached(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * The face of each `lows_unreached` point.
     * @returns {Uint32Array}
     */
    lows_unreached_faces() {
        const ret = wasm.denturereviewresult_lows_unreached_faces(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * The unit 45 degree no-support ray direction xyz.
     * @returns {Float64Array}
     */
    no_support_dir() {
        const ret = wasm.denturereviewresult_no_support_dir(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Step 1, per face: 1 when a 45 degree front-top parallel ray hits it first (NO_SUPPORT before the override), else 0.
     * @returns {Uint8Array}
     */
    no_support_mask() {
        const ret = wasm.denturereviewresult_no_support_mask(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Oral cavity ray origin xyz: on the rim plane, at the back edge of the tight box, on the symmetry plane (the allowed-area rays start here).
     * @returns {Float64Array}
     */
    oral_cavity_ray() {
        const ret = wasm.denturereviewresult_oral_cavity_ray(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Pillar geometry inputs: contact ball diameter, frustum base diameter, neck length, pillar diameter, lift (mm).
     * @returns {Float64Array}
     */
    pillar() {
        const ret = wasm.denturereviewresult_pillar(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Candidates released because their face is not an overhang for the plate normal.
     * @returns {number}
     */
    released() {
        const ret = wasm.denturereviewresult_released(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Per face: 1 within the rim band of the rim line (support-allowed; overhanging band faces get rim tips).
     * @returns {Uint8Array}
     */
    rim_band_mask() {
        const ret = wasm.denturereviewresult_rim_band_mask(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Per rim polyline: 1 when closed (the last edge joins the last point to the first).
     * @returns {Uint8Array}
     */
    rim_closed() {
        const ret = wasm.denturereviewresult_rim_closed(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Mesh edge ids of the rim polylines, back to back (a closed line has as many edges as points, an open one one fewer).
     * @returns {Uint32Array}
     */
    rim_edges() {
        const ret = wasm.denturereviewresult_rim_edges(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Total rim length (mm), line count, all the way around 0/1, largest empty stretch (deg); zeros without a rim.
     * @returns {Float64Array}
     */
    rim_info() {
        const ret = wasm.denturereviewresult_rim_info(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * The rim (engine 20): one or more ordered polylines of mesh vertex positions, `x y z` each, back to back.
     * @returns {Float64Array}
     */
    rim_loops() {
        const ret = wasm.denturereviewresult_rim_loops(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Rim plane: point xyz, unit normal xyz pointing to the top; empty without a rim.
     * @returns {Float64Array}
     */
    rim_plane() {
        const ret = wasm.denturereviewresult_rim_plane(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Point count of each rim polyline.
     * @returns {Uint32Array}
     */
    rim_sizes() {
        const ret = wasm.denturereviewresult_rim_sizes(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Symmetry plane (splits the U left/right): point xyz, unit normal xyz.
     * @returns {Float64Array}
     */
    symmetry_plane() {
        const ret = wasm.denturereviewresult_symmetry_plane(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * The mesh face each tip stands on, in `tips` order.
     * @returns {Uint32Array}
     */
    tip_faces() {
        const ret = wasm.denturereviewresult_tip_faces(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Generated tips, `x y z nx ny nz stream` each (0 low, 1 area, 4 rim, 5 hole, 6 island).
     * @returns {Float64Array}
     */
    tips() {
        const ret = wasm.denturereviewresult_tips(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Tips on an overhang with no free path to the plate, same layout as `tips`; not built.
     * @returns {Float64Array}
     */
    unsupportable() {
        const ret = wasm.denturereviewresult_unsupportable(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * The oriented pose's plate normal (up) in the mesh frame, xyz.
     * @returns {Float64Array}
     */
    up() {
        const ret = wasm.denturereviewresult_up(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * The up decision (layout in `denture/review.rs` `up_decision_values`): T1b diagnostic (box axis, decided, flipped, medians, margin, hits), up xyz, arch frame up before xyz, slice votes (for, against, abstain), confidence, top xyz, teeth flipped, back xyz, front/back margin, cross-check agrees, end widths; empty for a mesh with no box.
     * @returns {Float64Array}
     */
    up_decision() {
        const ret = wasm.denturereviewresult_up_decision(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
}
if (Symbol.dispose) DentureReviewResult.prototype[Symbol.dispose] = DentureReviewResult.prototype.free;
exports.DentureReviewResult = DentureReviewResult;

/**
 * The review GLB data of `diagnose`: coloured layers, one per role (docs/SHIP-PLAN.md ABI).
 */
class Diagnosis {
    static __wrap(ptr) {
        const obj = Object.create(Diagnosis.prototype);
        obj.__wbg_ptr = ptr;
        DiagnosisFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DiagnosisFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_diagnosis_free(ptr, 0);
    }
    /**
     * 0xRRGGBB.
     * @param {number} layer
     * @returns {number}
     */
    layer_color(layer) {
        const ret = wasm.diagnosis_layer_color(this.__wbg_ptr, layer);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    layer_count() {
        const ret = wasm.diagnosis_layer_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} layer
     * @returns {string}
     */
    layer_name(layer) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.diagnosis_layer_name(this.__wbg_ptr, layer);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The request revision, echoed.
     * @returns {number}
     */
    revision() {
        const ret = wasm.diagnosis_revision(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Empty: the positions are a triangle soup.
     * @param {number} layer
     * @returns {Uint32Array}
     */
    take_layer_indices(layer) {
        const ret = wasm.diagnosis_take_layer_indices(this.__wbg_ptr, layer);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {number} layer
     * @returns {Float32Array}
     */
    take_layer_positions(layer) {
        const ret = wasm.diagnosis_take_layer_positions(this.__wbg_ptr, layer);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) Diagnosis.prototype[Symbol.dispose] = Diagnosis.prototype.free;
exports.Diagnosis = Diagnosis;

/**
 * Per-corner positions and flat normals of the approved faces (`allowed[face] == 1`).
 */
class FaceOverlay {
    static __wrap(ptr) {
        const obj = Object.create(FaceOverlay.prototype);
        obj.__wbg_ptr = ptr;
        FaceOverlayFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FaceOverlayFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_faceoverlay_free(ptr, 0);
    }
    /**
     * @returns {Float32Array}
     */
    take_normals() {
        const ret = wasm.faceoverlay_take_normals(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float32Array}
     */
    take_positions() {
        const ret = wasm.faceoverlay_take_positions(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) FaceOverlay.prototype[Symbol.dispose] = FaceOverlay.prototype.free;
exports.FaceOverlay = FaceOverlay;

/**
 * The result of `generate`: the support mesh arrays and tag tables (layout in `supports::flat`, the
 * tags index into `take_contact_ids`), what was left out, and the verdicts.
 */
class Generation {
    static __wrap(ptr) {
        const obj = Object.create(Generation.prototype);
        obj.__wbg_ptr = ptr;
        GenerationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GenerationFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_generation_free(ptr, 0);
    }
    /**
     * Non-empty when the islands could not be judged (no island is then called resolved).
     * @returns {string}
     */
    island_reason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.generation_island_reason(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    reason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.generation_reason(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The request revision, echoed so the host can drop a result that is not the newest.
     * @returns {number}
     */
    revision() {
        const ret = wasm.generation_revision(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * 0 clear, 1 blocked, 2 inconclusive.
     * @returns {number}
     */
    status() {
        const ret = wasm.generation_status(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * The full sentence when the time rule stopped the build ("stopped: no progress for 30 s"); empty otherwise.
     * @returns {string}
     */
    stop_reason() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.generation_stop_reason(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string[]}
     */
    take_contact_ids() {
        const ret = wasm.generation_take_contact_ids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string[]}
     */
    take_dropped() {
        const ret = wasm.generation_take_dropped(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string[]}
     */
    take_dropped_by_zones() {
        const ret = wasm.generation_take_dropped_by_zones(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Structures the repair switched off: 1 tree, 2 brace, 3 only the crossing brace segments.
     * @returns {Uint8Array}
     */
    take_fallback() {
        const ret = wasm.generation_take_fallback(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_indices() {
        const ret = wasm.generation_take_indices(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    take_intents() {
        const ret = wasm.generation_take_intents(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    take_island_heights() {
        const ret = wasm.generation_take_island_heights(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Per island: 0 resolved, 1 unresolved, 2 resolved only through manual support, 3 unresolved but outside the policy's permitted area.
     * @returns {Uint8Array}
     */
    take_island_status() {
        const ret = wasm.generation_take_island_status(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_island_vertices() {
        const ret = wasm.generation_take_island_vertices(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * `ISSUE_STRIDE` u32 per crossing of the final mesh.
     * @returns {Uint32Array}
     */
    take_issues() {
        const ret = wasm.generation_take_issues(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Left-out contacts with a reason: ids.
     * @returns {string[]}
     */
    take_left_out_ids() {
        const ret = wasm.generation_take_left_out_ids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Left-out contacts: x y z of each tip (plate frame, mm).
     * @returns {Float64Array}
     */
    take_left_out_points() {
        const ret = wasm.generation_take_left_out_points(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Left-out contacts: the reason of each, `step` or `step:part` (build-omission, leave-out:pillar, leave-out:neck, all-manual, structures-off-leave-out, structure-fallback).
     * @returns {string[]}
     */
    take_left_out_reasons() {
        const ret = wasm.generation_take_left_out_reasons(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float32Array}
     */
    take_positions() {
        const ret = wasm.generation_take_positions(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    take_reach() {
        const ret = wasm.generation_take_reach(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Per ring: perimeter, retained contacts, largest gap, review gap, needs review (0/1).
     * @returns {Float64Array}
     */
    take_rings() {
        const ret = wasm.generation_take_rings(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_tags() {
        const ret = wasm.generation_take_tags(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {number}
     */
    trials() {
        const ret = wasm.generation_trials(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) Generation.prototype[Symbol.dispose] = Generation.prototype.free;
exports.Generation = Generation;

/**
 * Automatic contacts: positions and normals (xyz f64), source codes (0 interior, 1 physical boundary,
 * 2 sharp ridge, 3 island), IDs, and the faces of each downward region.
 */
class GenericPlacement {
    static __wrap(ptr) {
        const obj = Object.create(GenericPlacement.prototype);
        obj.__wbg_ptr = ptr;
        GenericPlacementFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GenericPlacementFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_genericplacement_free(ptr, 0);
    }
    /**
     * @returns {string[]}
     */
    take_ids() {
        const ret = wasm.genericplacement_take_ids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    take_normals() {
        const ret = wasm.genericplacement_take_normals(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    take_positions() {
        const ret = wasm.genericplacement_take_positions(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_region_faces() {
        const ret = wasm.genericplacement_take_region_faces(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Start of each region in `region_faces`, plus the total as the last entry.
     * @returns {Uint32Array}
     */
    take_region_starts() {
        const ret = wasm.genericplacement_take_region_starts(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    take_sources() {
        const ret = wasm.genericplacement_take_sources(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) GenericPlacement.prototype[Symbol.dispose] = GenericPlacement.prototype.free;
exports.GenericPlacement = GenericPlacement;

/**
 * The composed contacts of a unit as a `PolicyResult`: IDs, positions, normals (xyz f64), origin
 * (1 manual), point class (0 none, 1 face, 2 edge, 3 vertical) and the allowed structures
 * (pillar, tree, brace, roof, cage, raft as 0/1).
 */
class GenericPolicyResult {
    static __wrap(ptr) {
        const obj = Object.create(GenericPolicyResult.prototype);
        obj.__wbg_ptr = ptr;
        GenericPolicyResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GenericPolicyResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_genericpolicyresult_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    permitted_faces() {
        const ret = wasm.genericpolicyresult_permitted_faces(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {string[]}
     */
    take_ids() {
        const ret = wasm.genericpolicyresult_take_ids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    take_kinds() {
        const ret = wasm.genericpolicyresult_take_kinds(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    take_normals() {
        const ret = wasm.genericpolicyresult_take_normals(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    take_origins() {
        const ret = wasm.genericpolicyresult_take_origins(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    take_positions() {
        const ret = wasm.genericpolicyresult_take_positions(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    take_structures() {
        const ret = wasm.genericpolicyresult_take_structures(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) GenericPolicyResult.prototype[Symbol.dispose] = GenericPolicyResult.prototype.free;
exports.GenericPolicyResult = GenericPolicyResult;

class GeometrySession {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GeometrySessionFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_geometrysession_free(ptr, 0);
    }
    /**
     * Builds the support mesh for contacts over a loaded plate-space model (`model` = u32::MAX for
     * none). `mode`: 0 preview, 1 export. `landings`: 0 exact surface, 2 the line target (exact, then
     * the voxel remesh unless a Low Poly preview): neck normals and landings are computed here.
     * `zones` are no-support stamps (`zones::ZONE_STRIDE` f64 each, plate space) and `landing_faces`
     * a per-face 0/1 mask of where a support may land (empty = no rule; the policy form of this
     * rule is `generate`'s `PolicyData`). Never returns a partial result.
     * @param {number} model
     * @param {string[]} ids
     * @param {Float64Array} contacts
     * @param {Float64Array} shapes
     * @param {Float64Array} settings
     * @param {number} mode
     * @param {number} landings
     * @param {string} label_text
     * @param {Float64Array} zones
     * @param {Uint8Array} landing_faces
     * @returns {SupportBuild}
     */
    build_supports(model, ids, contacts, shapes, settings, mode, landings, label_text, zones, landing_faces) {
        const ptr0 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(contacts, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(shapes, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayF64ToWasm0(settings, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(label_text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passArrayF64ToWasm0(zones, wasm.__wbindgen_malloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passArray8ToWasm0(landing_faces, wasm.__wbindgen_malloc);
        const len6 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_build_supports(this.__wbg_ptr, model, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, mode, landings, ptr4, len4, ptr5, len5, ptr6, len6);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return SupportBuild.__wrap(ret[0]);
    }
    /**
     * Vertical landing casts against a loaded model: for each `from` (xyz), the surface straight
     * below within `length` as 5 floats (face or -1, y, upward normal xyz).
     * @param {number} model
     * @param {Float64Array} from
     * @param {number} length
     * @returns {Float64Array}
     */
    cast_down(model, from, length) {
        const ptr0 = passArrayF64ToWasm0(from, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_cast_down(this.__wbg_ptr, model, ptr0, len0, length);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * The legacy dental placement (a painted-from-scratch area or an older saved policy), see
     * `dental::legacy`: the generic contacts the area permits plus the downward faces filled at
     * `spacing`. Positions and normals are in the turned frame (`rotation`, Euler XYZ radians).
     * @param {number} model
     * @param {string} profile
     * @param {Float64Array} rim
     * @param {Uint8Array} visibility_mask
     * @param {boolean} manual_area
     * @param {Float64Array} stamps
     * @param {Float64Array} rotation
     * @param {number} spacing
     * @param {number} overhang_angle_degrees
     * @param {Float64Array} initial_positions
     * @param {Float64Array} initial_normals
     * @returns {LegacyFill}
     */
    dental_legacy_fill(model, profile, rim, visibility_mask, manual_area, stamps, rotation, spacing, overhang_angle_degrees, initial_positions, initial_normals) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(rim, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray8ToWasm0(visibility_mask, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayF64ToWasm0(stamps, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArrayF64ToWasm0(rotation, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passArrayF64ToWasm0(initial_positions, wasm.__wbindgen_malloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passArrayF64ToWasm0(initial_normals, wasm.__wbindgen_malloc);
        const len6 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_dental_legacy_fill(this.__wbg_ptr, model, ptr0, len0, ptr1, len1, ptr2, len2, manual_area, ptr3, len3, ptr4, len4, spacing, overhang_angle_degrees, ptr5, len5, ptr6, len6);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return LegacyFill.__wrap(ret[0]);
    }
    /**
     * The unit's dental policy as a `PolicyResult` for `generate`, made from its saved area and
     * recomputed on use. `kind` 0 older saved policy, 1 area painted from scratch, 2 two-contour
     * (then `tuning` `[setback, width, density]` and the saved region arrays are required; a region
     * that detection does not reproduce permits nothing automatic). `stamps` are the unit-local area
     * edits (`STAMP_STRIDE` each), `structure` `[tree, brace]` as 0/1, `frame` the unit's placement
     * `[position xyz, rotation xyz]` the result is expressed in, `manual_positions` the unit's manual
     * tips (unit-local xyz triples): no suggested tip is offered next to one.
     * @param {number} model
     * @param {string} profile
     * @param {number} kind
     * @param {Float64Array} tuning
     * @param {Float64Array} stamps
     * @param {Uint8Array} saved_allowed_faces
     * @param {Uint8Array} saved_contact_faces
     * @param {Uint32Array} saved_outer_edges
     * @param {Uint32Array} saved_opening_edges
     * @param {Uint8Array} structure
     * @param {Float64Array} frame
     * @param {Float64Array} manual_positions
     * @returns {PolicyHandle}
     */
    dental_policy(model, profile, kind, tuning, stamps, saved_allowed_faces, saved_contact_faces, saved_outer_edges, saved_opening_edges, structure, frame, manual_positions) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(tuning, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(stamps, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArray8ToWasm0(saved_allowed_faces, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArray8ToWasm0(saved_contact_faces, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passArray32ToWasm0(saved_outer_edges, wasm.__wbindgen_malloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passArray32ToWasm0(saved_opening_edges, wasm.__wbindgen_malloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passArray8ToWasm0(structure, wasm.__wbindgen_malloc);
        const len7 = WASM_VECTOR_LEN;
        const ptr8 = passArrayF64ToWasm0(frame, wasm.__wbindgen_malloc);
        const len8 = WASM_VECTOR_LEN;
        const ptr9 = passArrayF64ToWasm0(manual_positions, wasm.__wbindgen_malloc);
        const len9 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_dental_policy(this.__wbg_ptr, model, ptr0, len0, kind, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, ptr8, len8, ptr9, len9);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PolicyHandle.__wrap(ret[0]);
    }
    /**
     * Print-angle search over the profile's tilt range (docs/ROADMAP.md F) with the host's current
     * support settings. `on_tilt(done, total)`, when given, is called after each scanned tilt.
     * @param {number} model
     * @param {string} profile
     * @param {number} neck_length_mm
     * @param {number} pillar_diameter_mm
     * @param {number} lift_mm
     * @param {boolean} braced
     * @param {Function | null} [on_tilt]
     * @returns {DentalTiltScanResult}
     */
    dental_tilt_scan(model, profile, neck_length_mm, pillar_diameter_mm, lift_mm, braced, on_tilt) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_dental_tilt_scan(this.__wbg_ptr, model, ptr0, len0, neck_length_mm, pillar_diameter_mm, lift_mm, braced, isLikeNone(on_tilt) ? 0 : addToExternrefTable0(on_tilt));
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return DentalTiltScanResult.__wrap(ret[0]);
    }
    /**
     * Classes every face by whether it lies within `radius_mm` of the owner points, of the generated points, of both or neither.
     * @param {number} model
     * @param {Float64Array} owner
     * @param {Float64Array} generated
     * @param {number} radius_mm
     * @returns {DentureAreaResult}
     */
    denture_compare_areas(model, owner, generated, radius_mm) {
        const ptr0 = passArrayF64ToWasm0(owner, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(generated, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_denture_compare_areas(this.__wbg_ptr, model, ptr0, len0, ptr1, len1, radius_mm);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return DentureAreaResult.__wrap(ret[0]);
    }
    /**
     * The denture policy of a unit as a `PolicyResult` for `generate`: every face permitted, the
     * pose's tips as candidates (lowest points, bottom band, bars, light fill), pillars may land on
     * the model, Tree off, Brace by `brace`. `frame` is the unit's placement `[position xyz,
     * rotation xyz]` the result is expressed in (its +Y is the plate normal the tips are placed
     * for); `manual_positions` the unit's manual tips (unit-local xyz triples) to keep clear of.
     * @param {number} model
     * @param {string} profile
     * @param {Float64Array} frame
     * @param {boolean} brace
     * @param {Float64Array} manual_positions
     * @returns {PolicyHandle}
     */
    denture_policy(model, profile, frame, brace, manual_positions) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(frame, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(manual_positions, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_denture_policy(this.__wbg_ptr, model, ptr0, len0, ptr1, len1, brace, ptr2, len2);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PolicyHandle.__wrap(ret[0]);
    }
    /**
     * [`denture_policy`] with the host's rule overrides (`rules`, one entry per name of `rule_names()`; a missing or NaN entry keeps
     * Rust's default). The rules `islandTips`, `islandMinAreaMm2`, `lowOutsideAllowed`, `islandReuseMm` and `islandSlabMm` apply: an
     * island tip (candidate source "island") stands at the lowest vertex of each island of the pose, and the handle's
     * `island_facts()` reports every island.
     * @param {number} model
     * @param {string} profile
     * @param {Float64Array} frame
     * @param {boolean} brace
     * @param {Float64Array} manual_positions
     * @param {Float64Array} rules
     * @returns {PolicyHandle}
     */
    denture_policy_ruled(model, profile, frame, brace, manual_positions, rules) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(frame, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(manual_positions, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayF64ToWasm0(rules, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_denture_policy_ruled(this.__wbg_ptr, model, ptr0, len0, ptr1, len1, brace, ptr2, len2, ptr3, len3);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PolicyHandle.__wrap(ret[0]);
    }
    /**
     * The review layers of the owner denture rules on a loaded mesh (independent of its import orientation) at the print tilt `tilt_deg` (0 = canonical).
     * @param {number} model
     * @param {string} profile
     * @param {number} tilt_deg
     * @returns {DentureReviewResult | undefined}
     */
    denture_review(model, profile, tilt_deg) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_denture_review(this.__wbg_ptr, model, ptr0, len0, tilt_deg);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] === 0 ? undefined : DentureReviewResult.__wrap(ret[0]);
    }
    /**
     * [`denture_review`] with the host's rule overrides (`rules`, `rule_names()` order; empty keeps the defaults): the island tips and the low-tip admission (`lowOutsideAllowed`) apply.
     * @param {number} model
     * @param {string} profile
     * @param {number} tilt_deg
     * @param {Float64Array} rules
     * @returns {DentureReviewResult | undefined}
     */
    denture_review_ruled(model, profile, tilt_deg, rules) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(rules, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_denture_review_ruled(this.__wbg_ptr, model, ptr0, len0, tilt_deg, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] === 0 ? undefined : DentureReviewResult.__wrap(ret[0]);
    }
    /**
     * Print-angle search of a denture from upright over the profile's range, with the host's
     * current support settings; rows as `dental_tilt_scan` (fitting-side tips and rim gap are 0).
     * `on_tilt(done, total)`, when given, is called after each scanned tilt. The default support
     * rules apply (`denture_tilt_scan_ruled` takes the host's).
     * @param {number} model
     * @param {string} profile
     * @param {number} neck_length_mm
     * @param {number} pillar_diameter_mm
     * @param {number} lift_mm
     * @param {boolean} braced
     * @param {Function | null} [on_tilt]
     * @returns {DentalTiltScanResult}
     */
    denture_tilt_scan(model, profile, neck_length_mm, pillar_diameter_mm, lift_mm, braced, on_tilt) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_denture_tilt_scan(this.__wbg_ptr, model, ptr0, len0, neck_length_mm, pillar_diameter_mm, lift_mm, braced, isLikeNone(on_tilt) ? 0 : addToExternrefTable0(on_tilt));
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return DentalTiltScanResult.__wrap(ret[0]);
    }
    /**
     * [`denture_tilt_scan`] with the host's support-rule overrides (`rules`, one entry per name of `rule_names()`; a missing or NaN
     * entry keeps Rust's default). The rule `boxedInTiltWeight` (default 1) makes the pick prefer the tilt with the fewest lowest
     * points no support can reach; 0 turns that off. The result then also carries `boxed_counts()` (per row), `boxed_points()` and
     * `boxed_reasons()` (the picked row's boxed-in points).
     * @param {number} model
     * @param {string} profile
     * @param {number} neck_length_mm
     * @param {number} pillar_diameter_mm
     * @param {number} lift_mm
     * @param {boolean} braced
     * @param {Float64Array} rules
     * @param {Function | null} [on_tilt]
     * @returns {DentalTiltScanResult}
     */
    denture_tilt_scan_ruled(model, profile, neck_length_mm, pillar_diameter_mm, lift_mm, braced, rules, on_tilt) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(rules, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_denture_tilt_scan_ruled(this.__wbg_ptr, model, ptr0, len0, neck_length_mm, pillar_diameter_mm, lift_mm, braced, ptr1, len1, isLikeNone(on_tilt) ? 0 : addToExternrefTable0(on_tilt));
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return DentalTiltScanResult.__wrap(ret[0]);
    }
    /**
     * Review layers of a loaded aligner: the contact strip, the contours and, when given, the
     * diagnostic strips (`bands`: four masks of one byte per face, or empty), the sampled
     * contacts (position then normal, 6 numbers each), and a support mesh with a tip flag per
     * triangle. Review only; nothing here is support permission.
     * @param {number} model
     * @param {number} revision
     * @param {string} profile
     * @param {Uint8Array} contact_faces
     * @param {Uint32Array} outer_ridge_edges
     * @param {Uint32Array} connector_edges
     * @param {Uint32Array} opening_edges
     * @param {Uint8Array} bands
     * @param {Float64Array} outer_contacts
     * @param {Float64Array} inner_contacts
     * @param {Float32Array} support_positions
     * @param {Uint32Array} support_indices
     * @param {Uint8Array} tip_flags
     * @returns {Diagnosis}
     */
    diagnose(model, revision, profile, contact_faces, outer_ridge_edges, connector_edges, opening_edges, bands, outer_contacts, inner_contacts, support_positions, support_indices, tip_flags) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(contact_faces, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray32ToWasm0(outer_ridge_edges, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArray32ToWasm0(connector_edges, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArray32ToWasm0(opening_edges, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passArray8ToWasm0(bands, wasm.__wbindgen_malloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passArrayF64ToWasm0(outer_contacts, wasm.__wbindgen_malloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passArrayF64ToWasm0(inner_contacts, wasm.__wbindgen_malloc);
        const len7 = WASM_VECTOR_LEN;
        const ptr8 = passArrayF32ToWasm0(support_positions, wasm.__wbindgen_malloc);
        const len8 = WASM_VECTOR_LEN;
        const ptr9 = passArray32ToWasm0(support_indices, wasm.__wbindgen_malloc);
        const len9 = WASM_VECTOR_LEN;
        const ptr10 = passArray8ToWasm0(tip_flags, wasm.__wbindgen_malloc);
        const len10 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_diagnose(this.__wbg_ptr, model, revision, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, ptr8, len8, ptr9, len9, ptr10, len10);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Diagnosis.__wrap(ret[0]);
    }
    /**
     * Step 1 evidence layers of a loaded aligner (`dental::review_orientation`): the detected trim
     * chains, the two U ends, the bottom plane's outline and the back arrow. Review only.
     * @param {number} model
     * @param {number} revision
     * @param {string} profile
     * @returns {Diagnosis}
     */
    diagnose_orientation(model, revision, profile) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_diagnose_orientation(this.__wbg_ptr, model, revision, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Diagnosis.__wrap(ret[0]);
    }
    /**
     * The support pipeline for a plate-space model: `contacts` and `shapes` as `build_supports`,
     * `policy` the unit's policy as Rust made it (same frame as the model). `limits` overrides the time rule
     * (`supports::time_limits::TimeRules::from_overrides`: base, per tip, per 100k triangles, stall, ceiling; ms; a missing or NaN
     * entry keeps the default, an empty array keeps them all). The build gets a start allowance by size, is extended while it
     * progresses, and stops with an inconclusive verdict (never a clear one) after the stall window or at the ceiling;
     * `stop_reason()` then holds the sentence. `rules` overrides the planner's rules (`supports::rules::SupportRules::from_overrides`,
     * one entry per name of `rule_names()`; a missing or NaN entry keeps Rust's default). `plate_y` is the
     * plate's height in the model's frame: 0 for a model placed on the plate; a lift change keeps the
     * placed model (and its caches) and moves the plate instead. Island heights are above the plate.
     * @param {number} model
     * @param {string[]} ids
     * @param {Float64Array} contacts
     * @param {Float64Array} shapes
     * @param {Float64Array} settings
     * @param {number} mode
     * @param {string} label_text
     * @param {Float64Array} zones
     * @param {PolicyHandle} policy
     * @param {Float64Array} limits
     * @param {Float64Array} rules
     * @param {number} revision
     * @param {number} plate_y
     * @param {Float64Array} frame
     * @returns {Generation}
     */
    generate(model, ids, contacts, shapes, settings, mode, label_text, zones, policy, limits, rules, revision, plate_y, frame) {
        const ptr0 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(contacts, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(shapes, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayF64ToWasm0(settings, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(label_text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passArrayF64ToWasm0(zones, wasm.__wbindgen_malloc);
        const len5 = WASM_VECTOR_LEN;
        _assertClass(policy, PolicyHandle);
        const ptr6 = passArrayF64ToWasm0(limits, wasm.__wbindgen_malloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passArrayF64ToWasm0(rules, wasm.__wbindgen_malloc);
        const len7 = WASM_VECTOR_LEN;
        const ptr8 = passArrayF64ToWasm0(frame, wasm.__wbindgen_malloc);
        const len8 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_generate(this.__wbg_ptr, model, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, mode, ptr4, len4, ptr5, len5, policy.__wbg_ptr, ptr6, len6, ptr7, len7, revision, plate_y, ptr8, len8);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Generation.__wrap(ret[0]);
    }
    /**
     * Automatic contacts of a loaded model (already in the frame they are wanted in).
     * @param {number} model
     * @param {Float64Array} settings
     * @returns {GenericPlacement}
     */
    generic_place(model, settings) {
        const ptr0 = passArrayF64ToWasm0(settings, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_generic_place(this.__wbg_ptr, model, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return GenericPlacement.__wrap(ret[0]);
    }
    /**
     * The generic policy of a unit as a `PolicyHandle` for `generate`: its contacts (automatic
     * minus deleted and zoned, plus manual; unit-local), every face of `model` permitted, the
     * structures the settings ask for, and `repair_budget` safety-repair trials (0: report only). Arguments as `generic_policy_contacts`.
     * @param {number} model
     * @param {Float64Array} settings
     * @param {string[]} auto_ids
     * @param {Float64Array} auto_positions
     * @param {Float64Array} auto_normals
     * @param {Uint8Array} auto_sources
     * @param {string[]} manual_ids
     * @param {Float64Array} manual_positions
     * @param {Float64Array} manual_normals
     * @param {Uint8Array} manual_sources
     * @param {string[]} deleted
     * @param {Float64Array} zones
     * @param {number} repair_budget
     * @returns {PolicyHandle}
     */
    generic_policy(model, settings, auto_ids, auto_positions, auto_normals, auto_sources, manual_ids, manual_positions, manual_normals, manual_sources, deleted, zones, repair_budget) {
        const ptr0 = passArrayF64ToWasm0(settings, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(auto_ids, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(auto_positions, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayF64ToWasm0(auto_normals, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArray8ToWasm0(auto_sources, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passArrayJsValueToWasm0(manual_ids, wasm.__wbindgen_malloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passArrayF64ToWasm0(manual_positions, wasm.__wbindgen_malloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passArrayF64ToWasm0(manual_normals, wasm.__wbindgen_malloc);
        const len7 = WASM_VECTOR_LEN;
        const ptr8 = passArray8ToWasm0(manual_sources, wasm.__wbindgen_malloc);
        const len8 = WASM_VECTOR_LEN;
        const ptr9 = passArrayJsValueToWasm0(deleted, wasm.__wbindgen_malloc);
        const len9 = WASM_VECTOR_LEN;
        const ptr10 = passArrayF64ToWasm0(zones, wasm.__wbindgen_malloc);
        const len10 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_generic_policy(this.__wbg_ptr, model, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, ptr8, len8, ptr9, len9, ptr10, len10, repair_budget);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PolicyHandle.__wrap(ret[0]);
    }
    /**
     * @param {Float32Array} positions
     * @param {Uint32Array} indices
     * @returns {number}
     */
    load_mesh(positions, indices) {
        const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_load_mesh(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * `load_mesh` with a pick index built elsewhere (`build_pick_index`, in a worker): used as is,
     * not rebuilt on the first pick. An index that does not fit the mesh is `INVALID_INDEX`.
     * @param {Float32Array} positions
     * @param {Uint32Array} indices
     * @param {Float32Array} bounds
     * @param {Uint32Array} links
     * @param {Uint32Array} order
     * @returns {number}
     */
    load_mesh_indexed(positions, indices, bounds, links, order) {
        const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF32ToWasm0(bounds, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArray32ToWasm0(links, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArray32ToWasm0(order, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_load_mesh_indexed(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * A copy of a loaded mesh placed by `frame` (`[position xyz, rotation xyz]`), loaded as a new
     * handle in this session: a unit's plate-space model without sending its positions again.
     * @param {number} handle
     * @param {Float64Array} frame
     * @returns {number}
     */
    load_placed(handle, frame) {
        const ptr0 = passArrayF64ToWasm0(frame, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_load_placed(this.__wbg_ptr, handle, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * @param {number} handle
     * @returns {Float32Array}
     */
    mesh_bounds(handle) {
        const ret = wasm.geometrysession_mesh_bounds(this.__wbg_ptr, handle);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {number} max_bytes
     */
    constructor(max_bytes) {
        const ret = wasm.geometrysession_new(max_bytes);
        this.__wbg_ptr = ret;
        GeometrySessionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Step 1: mesh check, orientation, central opening and whether they fit the profile.
     * @param {number} model
     * @param {string} profile
     * @returns {DentalOrientResult}
     */
    orient_dental(model, profile) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_orient_dental(this.__wbg_ptr, model, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return DentalOrientResult.__wrap(ret[0]);
    }
    /**
     * Step 1 for a denture: the upright frame (arch plane vertical, legs down, teeth side) and its rotation.
     * @param {number} model
     * @param {string} profile
     * @returns {DentureOrientResult}
     */
    orient_denture(model, profile) {
        const ptr0 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_orient_denture(this.__wbg_ptr, model, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return DentureOrientResult.__wrap(ret[0]);
    }
    /**
     * First hit of each ray (origin xyz, direction xyz, mesh-local): 5 floats per ray
     * (face or -1, distance, x, y, z). `side` 0 front, 1 back, 2 double.
     * @param {number} handle
     * @param {Float64Array} rays
     * @param {number} near
     * @param {number} far
     * @param {number} side
     * @returns {Float64Array}
     */
    pick(handle, rays, near, far, side) {
        const ptr0 = passArrayF64ToWasm0(rays, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_pick(this.__wbg_ptr, handle, ptr0, len0, near, far, side);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * The mesh's pick index as flat arrays (built now if it has none), to hand to another session.
     * @param {number} handle
     * @returns {PickIndex}
     */
    pick_index(handle) {
        const ret = wasm.geometrysession_pick_index(this.__wbg_ptr, handle);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PickIndex.__wrap(ret[0]);
    }
    /**
     * `pick` for canvas pixels (x, y pairs, y down); `clip_to_local` inverts projection * view * model.
     * @param {number} handle
     * @param {Float64Array} clip_to_local
     * @param {number} width
     * @param {number} height
     * @param {Float64Array} pixels
     * @param {number} near
     * @param {number} far
     * @param {number} side
     * @returns {Float64Array}
     */
    pick_pixels(handle, clip_to_local, width, height, pixels, near, far, side) {
        const ptr0 = passArrayF64ToWasm0(clip_to_local, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(pixels, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_pick_pixels(this.__wbg_ptr, handle, ptr0, len0, width, height, ptr1, len1, near, far, side);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v3;
    }
    /**
     * Where the pillar of that support may stand (`skeleton::edit::pillar_reach`): a grid mask around the
     * tip, `radius_mm` out at `grid_mm` a cell; `judged` false gives the cheap drop-map answer, true judges
     * every cell's support. `take_pieces()` holds [x0, z0, cell, nx, nz, then nx*nz cells as 0/1, row by row].
     * @param {number} model
     * @param {Float64Array} settings
     * @param {Float64Array} rules
     * @param {Float64Array} tip
     * @param {Float64Array} normal
     * @param {number} plate_y
     * @param {number} radius_mm
     * @param {number} grid_mm
     * @param {boolean} judged
     * @returns {Reroute}
     */
    pillar_reach(model, settings, rules, tip, normal, plate_y, radius_mm, grid_mm, judged) {
        const ptr0 = passArrayF64ToWasm0(settings, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(rules, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(tip, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayF64ToWasm0(normal, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_pillar_reach(this.__wbg_ptr, model, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, plate_y, radius_mm, grid_mm, judged);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Reroute.__wrap(ret[0]);
    }
    /**
     * Slots of the support bodies the brush stroke touches and can see (ascending). Occluders are
     * session meshes with the support-local to model-local matrices (16 f64 each) and sides.
     * @param {Float32Array} body_points
     * @param {Uint32Array} body_first
     * @param {Uint32Array} occluder_handles
     * @param {Float64Array} occluder_matrices
     * @param {Uint32Array} occluder_sides
     * @param {Float64Array} matrix
     * @param {Float64Array} eye
     * @param {Float64Array} size
     * @param {number} radius
     * @param {Float64Array} stroke
     * @param {number} start
     * @param {number} end
     * @param {Uint8Array} want
     * @returns {Uint32Array}
     */
    project_brush(body_points, body_first, occluder_handles, occluder_matrices, occluder_sides, matrix, eye, size, radius, stroke, start, end, want) {
        const ptr0 = passArrayF32ToWasm0(body_points, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(body_first, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray32ToWasm0(occluder_handles, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayF64ToWasm0(occluder_matrices, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArray32ToWasm0(occluder_sides, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passArrayF64ToWasm0(matrix, wasm.__wbindgen_malloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passArrayF64ToWasm0(eye, wasm.__wbindgen_malloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passArrayF64ToWasm0(size, wasm.__wbindgen_malloc);
        const len7 = WASM_VECTOR_LEN;
        const ptr8 = passArrayF64ToWasm0(stroke, wasm.__wbindgen_malloc);
        const len8 = WASM_VECTOR_LEN;
        const ptr9 = passArray8ToWasm0(want, wasm.__wbindgen_malloc);
        const len9 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_project_brush(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, radius, ptr8, len8, start, end, ptr9, len9);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v11 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v11;
    }
    /**
     * Detects the contours, the face cut and the contact strip, tuned by `[setback, width, density]`.
     * @param {number} model
     * @param {Float64Array} tuning
     * @param {string} profile
     * @returns {DentalRegionResult}
     */
    propose_dental_region(model, tuning, profile) {
        const ptr0 = passArrayF64ToWasm0(tuning, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_propose_dental_region(this.__wbg_ptr, model, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return DentalRegionResult.__wrap(ret[0]);
    }
    /**
     * @param {number} handle
     */
    release_mesh(handle) {
        const ret = wasm.geometrysession_release_mesh(this.__wbg_ptr, handle);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Live edit of one support (`skeleton::edit::reroute_support`): the tip at `tip` (xyz, plate frame)
     * with outward `normal`, its pillar dragged to plan (`x`, `z`); `settings` and `rules` as `generate`'s
     * (the capsule judge's margin comes from the rules). The result's `take_pieces()` is the skeleton, nine
     * numbers per piece: kind (0 tip cone, 1 neck, 2 rod, 3 transition, 4 trunk, 5 joint, 6 brace, 7 foot),
     * the piece's two points (xyz each; a joint or foot repeats its point) and its two radii (mm). Empty
     * with `refusal()` naming the rule that refused (too far, under the floor, clearance).
     * @param {number} model
     * @param {Float64Array} settings
     * @param {Float64Array} rules
     * @param {Float64Array} tip
     * @param {Float64Array} normal
     * @param {number} x
     * @param {number} z
     * @param {number} plate_y
     * @returns {Reroute}
     */
    reroute_support(model, settings, rules, tip, normal, x, z, plate_y) {
        const ptr0 = passArrayF64ToWasm0(settings, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(rules, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(tip, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayF64ToWasm0(normal, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_reroute_support(this.__wbg_ptr, model, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, x, z, plate_y);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Reroute.__wrap(ret[0]);
    }
    /**
     * Recomputes the strip and contacts for accepted contours. `phase_fraction` (of the even step)
     * NaN keeps phase 0, the primaries; 0.5 samples halfway between them.
     * @param {number} model
     * @param {Uint8Array} allowed_faces
     * @param {Uint32Array} outer_edges
     * @param {Uint32Array} opening_edges
     * @param {Float64Array} tuning
     * @param {number} phase_fraction
     * @param {string} profile
     * @returns {DentalRegionResult}
     */
    retune_dental_region(model, allowed_faces, outer_edges, opening_edges, tuning, phase_fraction, profile) {
        const ptr0 = passArray8ToWasm0(allowed_faces, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(outer_edges, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray32ToWasm0(opening_edges, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayF64ToWasm0(tuning, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_retune_dental_region(this.__wbg_ptr, model, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, phase_fraction, ptr4, len4);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return DentalRegionResult.__wrap(ret[0]);
    }
    /**
     * The mesh's positions through `matrix` (f64[16], column-major); `handedness` 0 keeps the
     * core frame, 1 mirrors Z for a left-handed host.
     * @param {number} handle
     * @param {Float64Array} matrix
     * @param {number} handedness
     * @returns {Float32Array}
     */
    transform(handle, matrix, handedness) {
        const ptr0 = passArrayF64ToWasm0(matrix, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.geometrysession_transform(this.__wbg_ptr, handle, ptr0, len0, handedness);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * @returns {number}
     */
    used_bytes() {
        const ret = wasm.geometrysession_used_bytes(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) GeometrySession.prototype[Symbol.dispose] = GeometrySession.prototype.free;
exports.GeometrySession = GeometrySession;

/**
 * Result of `rekey_hand_work`: the re-keyed removals, the target of each per-support settings ID
 * (empty string = dropped) and four counts (removals kept / reset, settings kept / reset).
 */
class HandWork {
    static __wrap(ptr) {
        const obj = Object.create(HandWork.prototype);
        obj.__wbg_ptr = ptr;
        HandWorkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HandWorkFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_handwork_free(ptr, 0);
    }
    /**
     * @returns {Uint32Array}
     */
    take_counts() {
        const ret = wasm.handwork_take_counts(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string[]}
     */
    take_deleted() {
        const ret = wasm.handwork_take_deleted(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string[]}
     */
    take_targets() {
        const ret = wasm.handwork_take_targets(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) HandWork.prototype[Symbol.dispose] = HandWork.prototype.free;
exports.HandWork = HandWork;

/**
 * The legacy dental placement result: the generic contacts kept and the face-fill contacts added.
 */
class LegacyFill {
    static __wrap(ptr) {
        const obj = Object.create(LegacyFill.prototype);
        obj.__wbg_ptr = ptr;
        LegacyFillFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LegacyFillFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_legacyfill_free(ptr, 0);
    }
    /**
     * @returns {string[]}
     */
    take_ids() {
        const ret = wasm.legacyfill_take_ids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Indices (into the generic contacts passed in) that were kept, in order.
     * @returns {Uint32Array}
     */
    take_kept() {
        const ret = wasm.legacyfill_take_kept(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    take_normals() {
        const ret = wasm.legacyfill_take_normals(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Contacts the face fill added.
     * @returns {Float64Array}
     */
    take_positions() {
        const ret = wasm.legacyfill_take_positions(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
}
if (Symbol.dispose) LegacyFill.prototype[Symbol.dispose] = LegacyFill.prototype.free;
exports.LegacyFill = LegacyFill;

/**
 * A mesh's pick index as flat arrays: per node `min xyz, max xyz` (`bounds`) and `start, count`
 * (`links`), then the triangle permutation (`order`). Transferable between realms.
 */
class PickIndex {
    static __wrap(ptr) {
        const obj = Object.create(PickIndex.prototype);
        obj.__wbg_ptr = ptr;
        PickIndexFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PickIndexFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pickindex_free(ptr, 0);
    }
    /**
     * @returns {Float32Array}
     */
    take_bounds() {
        const ret = wasm.pickindex_take_bounds(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_links() {
        const ret = wasm.pickindex_take_links(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_order() {
        const ret = wasm.pickindex_take_order(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) PickIndex.prototype[Symbol.dispose] = PickIndex.prototype.free;
exports.PickIndex = PickIndex;

/**
 * A `PolicyResult` made in Rust (`GeometrySession.dental_policy` / `generic_policy`) and handed
 * straight to `generate`. The host never assembles one; it can only read what it needs to show.
 */
class PolicyHandle {
    static __wrap(ptr) {
        const obj = Object.create(PolicyHandle.prototype);
        obj.__wbg_ptr = ptr;
        PolicyHandleFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PolicyHandleFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_policyhandle_free(ptr, 0);
    }
    /**
     * Source face per repair alternate (-1 none), in the order of `alternate_owners`.
     * @returns {Float64Array}
     */
    alternate_faces() {
        const ret = wasm.policyhandle_alternate_faces(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Per repair alternate: the candidate id it stands in for, in trial order.
     * @returns {string[]}
     */
    alternate_owners() {
        const ret = wasm.policyhandle_alternate_owners(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Point xyz then normal xyz per repair alternate, in the order of `alternate_owners`.
     * @returns {Float64Array}
     */
    alternate_points() {
        const ret = wasm.policyhandle_alternate_points(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * 0 every contact as given, 1 only contacts that reproduce a candidate.
     * @returns {number}
     */
    automatic() {
        const ret = wasm.policyhandle_automatic(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Source face per candidate (-1 none).
     * @returns {Float64Array}
     */
    candidate_faces() {
        const ret = wasm.policyhandle_candidate_faces(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Candidate ids, in order.
     * @returns {string[]}
     */
    candidate_ids() {
        const ret = wasm.policyhandle_candidate_ids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Point xyz then normal xyz per candidate (the frame the policy was made in).
     * @returns {Float64Array}
     */
    candidate_points() {
        const ret = wasm.policyhandle_candidate_points(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * A denture policy's islands, 9 numbers each (x y z, height above the pose's lowest vertex mm, footprint mm2, distance to the nearest planned tip mm or -1, state 0 tipped / 1 served by a tip nearby / 2 below min size / 3 in no-support zone / 4 outside allowed area / 5 no usable face, index of the serving candidate or -1, face or -1). Empty for any other policy or with the rule `islandTips` off.
     * @returns {Float64Array}
     */
    island_facts() {
        const ret = wasm.policyhandle_island_facts(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Why a denture policy could not tell its islands (the surface is not a clean manifold...); empty when it could.
     * @returns {string}
     */
    islands_note() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.policyhandle_islands_note(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {boolean}
     */
    islands_outside_permitted() {
        const ret = wasm.policyhandle_islands_outside_permitted(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * 1 when secondary landings are limited to the permitted faces.
     * @returns {number}
     */
    landing_rule() {
        const ret = wasm.policyhandle_landing_rule(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * `automatic`: 0 as given, 1 reproduce a candidate (0.03 mm, dot 0.95). `landing_rule`: 0
     * unrestricted, 1 approved faces. `islands_outside`: whether the policy has an outside.
     * @param {number} repair_budget
     * @param {number} automatic
     * @param {number} landing_rule
     * @param {boolean} islands_outside
     */
    constructor(repair_budget, automatic, landing_rule, islands_outside) {
        const ret = wasm.policyhandle_new_for_test(repair_budget, automatic, landing_rule, islands_outside);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        PolicyHandleFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * One 0/1 byte per source face.
     * @returns {Uint8Array}
     */
    permitted_faces() {
        const ret = wasm.policyhandle_permitted_faces(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * The aligner profile a dental policy was made with (empty for the generic policy).
     * @returns {string}
     */
    profile_id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.policyhandle_profile_id(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    repair_budget() {
        const ret = wasm.policyhandle_repair_budget(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * False when a saved dental area could not be reproduced from the mesh (no automatic support).
     * @returns {boolean}
     */
    reproduced() {
        const ret = wasm.policyhandle_reproduced(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    ring_count() {
        const ret = wasm.policyhandle_ring_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Candidate rows: point xyz, normal xyz, source face (-1 none).
     * @param {string[]} ids
     * @param {Float64Array} values
     */
    set_candidates(ids, values) {
        const ptr0 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(values, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.policyhandle_set_candidates(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * One 0/1 byte per source face.
     * @param {Uint8Array} mask
     */
    set_permitted_faces(mask) {
        const ptr0 = passArray8ToWasm0(mask, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.policyhandle_set_permitted_faces(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * pillar, tree, brace, roof, cage, raft as 0/1.
     * @param {Uint8Array} flags
     */
    set_structures(flags) {
        const ptr0 = passArray8ToWasm0(flags, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.policyhandle_set_structures(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * pillar, tree, brace, roof, cage, raft (1 = allowed).
     * @returns {Uint8Array}
     */
    structures() {
        const ret = wasm.policyhandle_structures(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Point xyz then normal xyz per suggested tip Add can snap to, painted or not (a dental policy only).
     * @returns {Float64Array}
     */
    suggested_points() {
        const ret = wasm.policyhandle_suggested_points(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
}
if (Symbol.dispose) PolicyHandle.prototype[Symbol.dispose] = PolicyHandle.prototype.free;
exports.PolicyHandle = PolicyHandle;

/**
 * The answer of a live edit (`GeometrySession::reroute_support`, `pillar_reach`): a flat number array and, for a refused reroute, the reason.
 */
class Reroute {
    static __wrap(ptr) {
        const obj = Object.create(Reroute.prototype);
        obj.__wbg_ptr = ptr;
        RerouteFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RerouteFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_reroute_free(ptr, 0);
    }
    /**
     * Why the reroute was refused; empty when it was taken.
     * @returns {string}
     */
    refusal() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.reroute_refusal(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The flat array (see the call that made it); taken once.
     * @returns {Float64Array}
     */
    take_pieces() {
        const ret = wasm.reroute_take_pieces(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
}
if (Symbol.dispose) Reroute.prototype[Symbol.dispose] = Reroute.prototype.free;
exports.Reroute = Reroute;

class SupportBuild {
    static __wrap(ptr) {
        const obj = Object.create(SupportBuild.prototype);
        obj.__wbg_ptr = ptr;
        SupportBuildFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SupportBuildFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_supportbuild_free(ptr, 0);
    }
    /**
     * @returns {Uint32Array}
     */
    take_dropped() {
        const ret = wasm.supportbuild_take_dropped(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_dropped_by_zones() {
        const ret = wasm.supportbuild_take_dropped_by_zones(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_indices() {
        const ret = wasm.supportbuild_take_indices(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    take_intents() {
        const ret = wasm.supportbuild_take_intents(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float32Array}
     */
    take_positions() {
        const ret = wasm.supportbuild_take_positions(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    take_reach() {
        const ret = wasm.supportbuild_take_reach(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    take_tags() {
        const ret = wasm.supportbuild_take_tags(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) SupportBuild.prototype[Symbol.dispose] = SupportBuild.prototype.free;
exports.SupportBuild = SupportBuild;

/**
 * Overhang spots the contacts leave unsupported: position xyz, area. (Islands are the `generate` verdict.)
 */
class SupportProblems {
    static __wrap(ptr) {
        const obj = Object.create(SupportProblems.prototype);
        obj.__wbg_ptr = ptr;
        SupportProblemsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SupportProblemsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_supportproblems_free(ptr, 0);
    }
    /**
     * @returns {Float64Array}
     */
    take_areas() {
        const ret = wasm.supportproblems_take_areas(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    take_positions() {
        const ret = wasm.supportproblems_take_positions(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
}
if (Symbol.dispose) SupportProblems.prototype[Symbol.dispose] = SupportProblems.prototype.free;
exports.SupportProblems = SupportProblems;

class WeldResult {
    static __wrap(ptr) {
        const obj = Object.create(WeldResult.prototype);
        obj.__wbg_ptr = ptr;
        WeldResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WeldResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_weldresult_free(ptr, 0);
    }
    /**
     * @returns {Uint32Array}
     */
    take_indices() {
        const ret = wasm.weldresult_take_indices(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float32Array}
     */
    take_positions() {
        const ret = wasm.weldresult_take_positions(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) WeldResult.prototype[Symbol.dispose] = WeldResult.prototype.free;
exports.WeldResult = WeldResult;

/**
 * Support bodies as axis segments; component `k` covers `indices[start[k] .. start[k] + count[k]]`
 * and belongs to contact key `contact[k]` (`0xFFFFFFFF` for none).
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {Uint32Array} contact
 * @param {Uint32Array} start
 * @param {Uint32Array} count
 * @returns {BodySegmentsResult}
 */
function body_segments(positions, indices, contact, start, count) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray32ToWasm0(contact, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray32ToWasm0(start, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passArray32ToWasm0(count, wasm.__wbindgen_malloc);
    const len4 = WASM_VECTOR_LEN;
    const ret = wasm.body_segments(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return BodySegmentsResult.__wrap(ret[0]);
}
exports.body_segments = body_segments;

/**
 * The pick index of a mesh outside any session (the import worker builds it once; the main
 * thread loads it with `GeometrySession.load_mesh_indexed`).
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @returns {PickIndex}
 */
function build_pick_index(positions, indices) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.build_pick_index(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return PickIndex.__wrap(ret[0]);
}
exports.build_pick_index = build_pick_index;

/**
 * Mutates the caller's vertex buffer and returns center XYZ, then original min/max XYZ.
 * @param {Float32Array} positions
 * @returns {Float64Array}
 */
function center_positions_in_place(positions) {
    var ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    const ret = wasm.center_positions_in_place(ptr0, len0, positions);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}
exports.center_positions_in_place = center_positions_in_place;

/**
 * The support check over a mesh in the frame it is checked in (Y up): `contacts` are xyz triples.
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {Float64Array} contacts
 * @param {number} overhang_angle_degrees
 * @param {number} spacing
 * @returns {SupportProblems}
 */
function check_support_problems(positions, indices, contacts, overhang_angle_degrees, spacing) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayF64ToWasm0(contacts, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.check_support_problems(ptr0, len0, ptr1, len1, ptr2, len2, overhang_angle_degrees, spacing);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return SupportProblems.__wrap(ret[0]);
}
exports.check_support_problems = check_support_problems;

/**
 * Automatic contacts an old radius removal hid.
 * @param {string[]} auto_ids
 * @param {Float64Array} auto_positions
 * @param {string[]} markers
 * @param {number} erase_radius
 * @returns {string[]}
 */
function contacts_hidden_by_marker_ids(auto_ids, auto_positions, markers, erase_radius) {
    const ptr0 = passArrayJsValueToWasm0(auto_ids, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(auto_positions, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(markers, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.contacts_hidden_by_marker_ids(ptr0, len0, ptr1, len1, ptr2, len2, erase_radius);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v4;
}
exports.contacts_hidden_by_marker_ids = contacts_hidden_by_marker_ids;

/**
 * Returns a simplified display copy; the caller keeps the full mesh for support and export.
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {number} max_triangles
 * @returns {WeldResult}
 */
function decimate_display(positions, indices, max_triangles) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.decimate_display(ptr0, len0, ptr1, len1, max_triangles);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WeldResult.__wrap(ret[0]);
}
exports.decimate_display = decimate_display;

/**
 * One byte per mesh vertex: the legacy allowed-area overlay (the footprint or the paint, and
 * seen first from the opening). `normals` is one unit-frame normal per vertex, or empty.
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {Float32Array} normals
 * @param {Float64Array} rim
 * @param {Uint8Array} visibility_mask
 * @param {boolean} manual_area
 * @param {Float64Array} stamps
 * @param {string} profile
 * @returns {Uint8Array}
 */
function dental_allowed_vertices(positions, indices, normals, rim, visibility_mask, manual_area, stamps, profile) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayF32ToWasm0(normals, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArrayF64ToWasm0(rim, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passArray8ToWasm0(visibility_mask, wasm.__wbindgen_malloc);
    const len4 = WASM_VECTOR_LEN;
    const ptr5 = passArrayF64ToWasm0(stamps, wasm.__wbindgen_malloc);
    const len5 = WASM_VECTOR_LEN;
    const ptr6 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len6 = WASM_VECTOR_LEN;
    const ret = wasm.dental_allowed_vertices(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, manual_area, ptr5, len5, ptr6, len6);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v8 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v8;
}
exports.dental_allowed_vertices = dental_allowed_vertices;

/**
 * The area a tuning `[position, width, density]` gives on `profile`, as signed contour distances
 * `[low, high]` (`Tuning::band`), so review scripts draw the same area as the app.
 * @param {Float64Array} tuning
 * @param {string} profile
 * @returns {Float64Array}
 */
function dental_area_band(tuning, profile) {
    const ptr0 = passArrayF64ToWasm0(tuning, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.dental_area_band(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v3;
}
exports.dental_area_band = dental_area_band;

/**
 * The contact footprint for explicit strip settings:
 * `[low, high, outerSpacing, innerSpacing, maxSearch, phaseFraction, minTipSeparation]`: the area is
 * the faces whose signed contour distance lies in `[low, high]` (negative across the edge), tips on
 * its middle line (phase NaN = 0, a fraction of the even step; separation 0 = off), optionally followed by
 * `[upX, upY, upZ, maxUp, moveMm]`: tips a support cannot reach from below the plate normal `up`
 * move (`footprint::Facing`). `ok()` false carries the raw reason.
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {Uint8Array} allowed_faces
 * @param {Uint32Array} outer_edges
 * @param {Uint32Array} opening_edges
 * @param {Float64Array} settings
 * @returns {DentalRegionResult}
 */
function dental_footprint(positions, indices, allowed_faces, outer_edges, opening_edges, settings) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(allowed_faces, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray32ToWasm0(outer_edges, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passArray32ToWasm0(opening_edges, wasm.__wbindgen_malloc);
    const len4 = WASM_VECTOR_LEN;
    const ptr5 = passArrayF64ToWasm0(settings, wasm.__wbindgen_malloc);
    const len5 = WASM_VECTOR_LEN;
    const ret = wasm.dental_footprint(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return DentalRegionResult.__wrap(ret[0]);
}
exports.dental_footprint = dental_footprint;

/**
 * Euler XYZ radians restoring the profile's target pose, or empty for an ambiguous arch.
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {Float64Array} rim_scalars
 * @param {string} profile
 * @returns {Float64Array}
 */
function dental_pose(positions, indices, rim_scalars, profile) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayF64ToWasm0(rim_scalars, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.dental_pose(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v5;
}
exports.dental_pose = dental_pose;

/**
 * @returns {string[]}
 */
function dental_profile_ids() {
    const ret = wasm.dental_profile_ids();
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}
exports.dental_profile_ids = dental_profile_ids;

/**
 * `phase_fraction` (of the even step) NaN keeps phase 0; `min_separation` 0 turns the 3D minimum off.
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {Uint32Array} contour
 * @param {Uint8Array} side_band
 * @param {number} spacing
 * @param {number} max_search
 * @param {number} phase_fraction
 * @param {number} min_separation
 * @returns {DentalSampleResult}
 */
function dental_sample_contacts(positions, indices, contour, side_band, spacing, max_search, phase_fraction, min_separation) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray32ToWasm0(contour, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray8ToWasm0(side_band, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.dental_sample_contacts(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, spacing, max_search, phase_fraction, min_separation);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return DentalSampleResult.__wrap(ret[0]);
}
exports.dental_sample_contacts = dental_sample_contacts;

/**
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {Uint8Array} allowed_faces
 * @param {Uint32Array} outer_edges
 * @param {Uint32Array} opening_edges
 * @param {number} setback
 * @param {number} width
 * @returns {DentalBandsResult}
 */
function dental_side_bands(positions, indices, allowed_faces, outer_edges, opening_edges, setback, width) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(allowed_faces, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray32ToWasm0(outer_edges, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passArray32ToWasm0(opening_edges, wasm.__wbindgen_malloc);
    const len4 = WASM_VECTOR_LEN;
    const ret = wasm.dental_side_bands(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, setback, width);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return DentalBandsResult.__wrap(ret[0]);
}
exports.dental_side_bands = dental_side_bands;

/**
 * @returns {string[]}
 */
function denture_profile_ids() {
    const ret = wasm.denture_profile_ids();
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}
exports.denture_profile_ids = denture_profile_ids;

/**
 * @returns {number}
 */
function engine_version() {
    const ret = wasm.engine_version();
    return ret >>> 0;
}
exports.engine_version = engine_version;

/**
 * @param {Float32Array} positions
 * @param {Uint32Array} pairs
 * @returns {Float32Array}
 */
function face_mask_contour_segments(positions, pairs) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(pairs, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.face_mask_contour_segments(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
}
exports.face_mask_contour_segments = face_mask_contour_segments;

/**
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {Uint8Array} allowed
 * @returns {FaceOverlay}
 */
function face_mask_overlay(positions, indices, allowed) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(allowed, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.face_mask_overlay(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return FaceOverlay.__wrap(ret[0]);
}
exports.face_mask_overlay = face_mask_overlay;

/**
 * `generic_policy`: the contacts of a unit (unit-local space): automatic minus deleted and zoned,
 * plus manual. `face_count` is the source mesh's face count.
 * @param {number} face_count
 * @param {Float64Array} settings
 * @param {string[]} auto_ids
 * @param {Float64Array} auto_positions
 * @param {Float64Array} auto_normals
 * @param {Uint8Array} auto_sources
 * @param {string[]} manual_ids
 * @param {Float64Array} manual_positions
 * @param {Float64Array} manual_normals
 * @param {Uint8Array} manual_sources
 * @param {string[]} deleted
 * @param {Float64Array} zones
 * @returns {GenericPolicyResult}
 */
function generic_policy_contacts(face_count, settings, auto_ids, auto_positions, auto_normals, auto_sources, manual_ids, manual_positions, manual_normals, manual_sources, deleted, zones) {
    const ptr0 = passArrayF64ToWasm0(settings, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(auto_ids, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayF64ToWasm0(auto_positions, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArrayF64ToWasm0(auto_normals, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passArray8ToWasm0(auto_sources, wasm.__wbindgen_malloc);
    const len4 = WASM_VECTOR_LEN;
    const ptr5 = passArrayJsValueToWasm0(manual_ids, wasm.__wbindgen_malloc);
    const len5 = WASM_VECTOR_LEN;
    const ptr6 = passArrayF64ToWasm0(manual_positions, wasm.__wbindgen_malloc);
    const len6 = WASM_VECTOR_LEN;
    const ptr7 = passArrayF64ToWasm0(manual_normals, wasm.__wbindgen_malloc);
    const len7 = WASM_VECTOR_LEN;
    const ptr8 = passArray8ToWasm0(manual_sources, wasm.__wbindgen_malloc);
    const len8 = WASM_VECTOR_LEN;
    const ptr9 = passArrayJsValueToWasm0(deleted, wasm.__wbindgen_malloc);
    const len9 = WASM_VECTOR_LEN;
    const ptr10 = passArrayF64ToWasm0(zones, wasm.__wbindgen_malloc);
    const len10 = WASM_VECTOR_LEN;
    const ret = wasm.generic_policy_contacts(face_count, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, ptr8, len8, ptr9, len9, ptr10, len10);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return GenericPolicyResult.__wrap(ret[0]);
}
exports.generic_policy_contacts = generic_policy_contacts;

/**
 * Removals that hide an automatic contact right now.
 * @param {string[]} auto_ids
 * @param {string[]} deleted
 * @returns {string[]}
 */
function hiding_removal_ids(auto_ids, deleted) {
    const ptr0 = passArrayJsValueToWasm0(auto_ids, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(deleted, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.hiding_removal_ids(ptr0, len0, ptr1, len1);
    var v3 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
}
exports.hiding_removal_ids = hiding_removal_ids;

/**
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {Float64Array} rim_scalars
 * @param {string} profile
 * @returns {DentalOpeningResult}
 */
function inspect_dental_opening(positions, indices, rim_scalars, profile) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayF64ToWasm0(rim_scalars, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.inspect_dental_opening(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return DentalOpeningResult.__wrap(ret[0]);
}
exports.inspect_dental_opening = inspect_dental_opening;

/**
 * @param {Float64Array} matrix
 * @returns {Float64Array}
 */
function invert_matrix(matrix) {
    const ptr0 = passArrayF64ToWasm0(matrix, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.invert_matrix(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}
exports.invert_matrix = invert_matrix;

/**
 * @returns {number}
 */
function live_mesh_handles() {
    const ret = wasm.live_mesh_handles();
    return ret >>> 0;
}
exports.live_mesh_handles = live_mesh_handles;

/**
 * Permission from an area painted from scratch (origin `manual-area`), one byte per face. Throws
 * `DETECTED_AREA_EXISTS` when detection found an area and `INVALID_INDEX` for a face outside the mesh.
 * @param {number} face_count
 * @param {Uint32Array} painted_faces
 * @param {boolean} detected
 * @param {string} profile
 * @returns {Uint8Array}
 */
function manual_dental_area(face_count, painted_faces, detected, profile) {
    const ptr0 = passArray32ToWasm0(painted_faces, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.manual_dental_area(face_count, ptr0, len0, detected, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}
exports.manual_dental_area = manual_dental_area;

/**
 * `manual_dental_area` from ordered brush stamps (8 numbers each).
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {Float64Array} stamps
 * @param {boolean} detected
 * @param {string} profile
 * @returns {Uint8Array}
 */
function manual_dental_area_from_stamps(positions, indices, stamps, detected, profile) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayF64ToWasm0(stamps, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.manual_dental_area_from_stamps(ptr0, len0, ptr1, len1, ptr2, len2, detected, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}
exports.manual_dental_area_from_stamps = manual_dental_area_from_stamps;

/**
 * Placement matrix (f64[16]) of a position (mm) and Euler XYZ rotation (radians).
 * @param {Float64Array} position
 * @param {Float64Array} rotation
 * @returns {Float64Array}
 */
function placement_matrix(position, rotation) {
    const ptr0 = passArrayF64ToWasm0(position, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(rotation, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.placement_matrix(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v3;
}
exports.placement_matrix = placement_matrix;

/**
 * The ID each position encodes on the 0.01 mm grid (`auto-X_Y_Z`).
 * @param {Float64Array} positions
 * @returns {string[]}
 */
function position_ids(positions) {
    const ptr0 = passArrayF64ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.position_ids(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}
exports.position_ids = position_ids;

/**
 * The cavity opening and its rim only (no central-opening or pose evaluation). `status()` 0 is a
 * proposal; 1 is inconclusive with `reason()`.
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {string} profile
 * @returns {DentalOrientResult}
 */
function propose_dental_orientation(positions, indices, profile) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(profile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.propose_dental_orientation(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return DentalOrientResult.__wrap(ret[0]);
}
exports.propose_dental_orientation = propose_dental_orientation;

/**
 * A finer display copy of a mesh for the zone layer (the input when it already fits).
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {number} max_edge
 * @param {number} max_triangles
 * @returns {WeldResult}
 */
function refine_for_overlay(positions, indices, max_edge, max_triangles) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.refine_for_overlay(ptr0, len0, ptr1, len1, max_edge, max_triangles);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WeldResult.__wrap(ret[0]);
}
exports.refine_for_overlay = refine_for_overlay;

/**
 * IDs of stored automatic contacts re-derived from their positions (`rekeyPoints`).
 * @param {string[]} ids
 * @param {Float64Array} positions
 * @returns {string[]}
 */
function rekey_contact_ids(ids, positions) {
    const ptr0 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(positions, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.rekey_contact_ids(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
}
exports.rekey_contact_ids = rekey_contact_ids;

/**
 * @param {string[]} deleted
 * @param {string[]} override_ids
 * @param {string[]} manual_ids
 * @param {string[]} point_ids
 * @param {Float64Array} point_positions
 * @param {number} match_radius
 * @returns {HandWork}
 */
function rekey_hand_work(deleted, override_ids, manual_ids, point_ids, point_positions, match_radius) {
    const ptr0 = passArrayJsValueToWasm0(deleted, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(override_ids, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(manual_ids, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArrayJsValueToWasm0(point_ids, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passArrayF64ToWasm0(point_positions, wasm.__wbindgen_malloc);
    const len4 = WASM_VECTOR_LEN;
    const ret = wasm.rekey_hand_work(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, match_radius);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return HandWork.__wrap(ret[0]);
}
exports.rekey_hand_work = rekey_hand_work;

/**
 * The deleted IDs, re-keyed to a fresh placement (`remap_deleted`).
 * @param {string[]} deleted
 * @param {string[]} point_ids
 * @param {Float64Array} point_positions
 * @param {number} match_radius
 * @returns {string[]}
 */
function remap_deleted_ids(deleted, point_ids, point_positions, match_radius) {
    const ptr0 = passArrayJsValueToWasm0(deleted, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(point_ids, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayF64ToWasm0(point_positions, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.remap_deleted_ids(ptr0, len0, ptr1, len1, ptr2, len2, match_radius);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v4;
}
exports.remap_deleted_ids = remap_deleted_ids;

/**
 * The voxel remesh cache's `[hits, misses]` since the module loaded: tests prove a rebuild reused it.
 * @returns {Uint32Array}
 */
function remesh_cache_stats() {
    const ret = wasm.remesh_cache_stats();
    var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}
exports.remesh_cache_stats = remesh_cache_stats;

/**
 * Removes collapsed triangles; the host reports the count.
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @returns {WeldResult}
 */
function remove_degenerate_triangles(positions, indices) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.remove_degenerate_triangles(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WeldResult.__wrap(ret[0]);
}
exports.remove_degenerate_triangles = remove_degenerate_triangles;

/**
 * The names of the planner rules `generate`'s `rules` array overrides, in array order
 * (`mixo_geometry_core::supports::rules::NAMES`): the host packs its overrides by these names.
 * @returns {string[]}
 */
function rule_names() {
    const ret = wasm.rule_names();
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}
exports.rule_names = rule_names;

/**
 * Flat order of the settings array (`SETTINGS_LAYOUT`), for the host packer to check against.
 * @returns {string[]}
 */
function support_settings_layout() {
    const ret = wasm.support_settings_layout();
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}
exports.support_settings_layout = support_settings_layout;

/**
 * Positions of any mesh (not necessarily in a session) through a matrix; see `GeometrySession.transform`.
 * @param {Float32Array} positions
 * @param {Float64Array} matrix
 * @param {number} handedness
 * @returns {Float32Array}
 */
function transform_positions(positions, matrix, handedness) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(matrix, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.transform_positions(ptr0, len0, ptr1, len1, handedness);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
}
exports.transform_positions = transform_positions;

/**
 * A batch of f64 xyz triples through a matrix as points (with divide) or normalised directions.
 * @param {Float64Array} values
 * @param {Float64Array} matrix
 * @param {boolean} direction
 * @returns {Float64Array}
 */
function transform_vectors(values, matrix, direction) {
    const ptr0 = passArrayF64ToWasm0(values, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(matrix, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.transform_vectors(ptr0, len0, ptr1, len1, direction);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v3;
}
exports.transform_vectors = transform_vectors;

/**
 * Lowest y of the positions through a matrix (float32 like `transform_positions`), without the copy.
 * @param {Float32Array} positions
 * @param {Float64Array} matrix
 * @returns {number}
 */
function transformed_min_y(positions, matrix) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(matrix, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.transformed_min_y(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}
exports.transformed_min_y = transformed_min_y;

/**
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @returns {Float32Array}
 */
function vertex_normals(positions, indices) {
    const ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.vertex_normals(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
}
exports.vertex_normals = vertex_normals;

/**
 * Transforms and welds one raw mesh; empty indices mean sequential corners.
 * @param {Float32Array} positions
 * @param {Uint32Array} indices
 * @param {Float64Array} matrix
 * @returns {WeldResult}
 */
function weld_positions_in_place(positions, indices, matrix) {
    var ptr0 = passArrayF32ToWasm0(positions, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayF64ToWasm0(matrix, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.weld_positions_in_place(ptr0, len0, positions, ptr1, len1, ptr2, len2);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WeldResult.__wrap(ret[0]);
}
exports.weld_positions_in_place = weld_positions_in_place;

/**
 * Whether `point` is zoned by the no-support `zones` (`ZONE_STRIDE` f64 each): the last stamp that
 * reaches it decides, and an empty `normal` skips the side test. The one place the host asks the
 * stamp rule (`AreaStamp::resolve`), e.g. whether a check finding lies in a zone.
 * @param {Float64Array} zones
 * @param {Float64Array} point
 * @param {Float64Array} normal
 * @returns {boolean}
 */
function zoned_at(zones, point, normal) {
    const ptr0 = passArrayF64ToWasm0(zones, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(point, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayF64ToWasm0(normal, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.zoned_at(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}
exports.zoned_at = zoned_at;
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_copy_to_typed_array_88899a52af046901: function(arg0, arg1, arg2) {
            new Uint8Array(arg2.buffer, arg2.byteOffset, arg2.byteLength).set(getArrayU8FromWasm0(arg0, arg1));
        },
        __wbg___wbindgen_string_get_0380ccaa2f57f0d9: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_41e9ee4f547fc59a: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_call_1875a20c43a36133: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = arg0.call(arg1, arg2, arg3);
            return ret;
        }, arguments); },
        __wbg_new_343a093a3c2ffb4e: function(arg0, arg1) {
            const ret = new Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_now_aa4ccb83129e9e55: function() {
            const ret = Date.now();
            return ret;
        },
        __wbg_set_145a351398b48c65: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        }, arguments); },
        __wbindgen_generic_0000000000000001: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_generic_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./mixo_geometry_wasm_bg.js": import0,
    };
}

const AsciiStlSessionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_asciistlsession_free(ptr, 1));
const BinaryStlSessionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_binarystlsession_free(ptr, 1));
const BodySegmentsResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_bodysegmentsresult_free(ptr, 1));
const DentalBandsResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dentalbandsresult_free(ptr, 1));
const DentalOpeningResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dentalopeningresult_free(ptr, 1));
const DentalOrientResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dentalorientresult_free(ptr, 1));
const DentalRegionResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dentalregionresult_free(ptr, 1));
const DentalSampleResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dentalsampleresult_free(ptr, 1));
const DentalTiltScanResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dentaltiltscanresult_free(ptr, 1));
const DentureAreaResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_denturearearesult_free(ptr, 1));
const DentureOrientResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dentureorientresult_free(ptr, 1));
const DentureReviewResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_denturereviewresult_free(ptr, 1));
const DiagnosisFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_diagnosis_free(ptr, 1));
const FaceOverlayFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_faceoverlay_free(ptr, 1));
const GenerationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_generation_free(ptr, 1));
const GenericPlacementFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_genericplacement_free(ptr, 1));
const GenericPolicyResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_genericpolicyresult_free(ptr, 1));
const GeometrySessionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_geometrysession_free(ptr, 1));
const HandWorkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_handwork_free(ptr, 1));
const LegacyFillFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_legacyfill_free(ptr, 1));
const PickIndexFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pickindex_free(ptr, 1));
const PolicyHandleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_policyhandle_free(ptr, 1));
const RerouteFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_reroute_free(ptr, 1));
const SupportBuildFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_supportbuild_free(ptr, 1));
const SupportProblemsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_supportproblems_free(ptr, 1));
const WeldResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_weldresult_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
function decodeText(ptr, len) {
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

const wasmPath = `${__dirname}/mixo_geometry_wasm_bg.wasm`;
const wasmBytes = require('fs').readFileSync(wasmPath);
const wasmModule = new WebAssembly.Module(wasmBytes);
let wasmInstance = new WebAssembly.Instance(wasmModule, __wbg_get_imports());
let wasm = wasmInstance.exports;
wasm.__wbindgen_start();
