import { ensureDir } from "fs-extra";

import { readJson, writeJson } from "../util/io";
import { joinPaths } from "../util/util";
import { dataDirPath } from "./settings";

if (process.env.LONGJOHN) {
    console.log("=== USING LONGJOHN ===");
    const longjohn = require("longjohn") as { async_trace_limit: number }; // tslint:disable-line no-var-requires
    longjohn.async_trace_limit = -1; // unlimited
}

/** Settings that may be determined dynamically. */
export interface Options {
    /**
     * e.g. '../DefinitelyTyped'
     * This is overridden to `cwd` when running the tester, as that is run from within DefinitelyTyped.
     * If undefined, downloads instead.
     */
    readonly definitelyTypedPath: string | undefined;
    /** Whether to show progress bars. Good when running locally, bad when running on travis / azure. */
    readonly progress: boolean;
    /** Disabled on azure since it has problems logging errors from other processes. */
    readonly parseInParallel: boolean;
}
export namespace Options {
    /** Options for running locally. */
    export const defaults: TesterOptions = { definitelyTypedPath: "../DefinitelyTyped", progress: true, parseInParallel: true };
    export const azure: Options = { definitelyTypedPath: undefined, progress: false, parseInParallel: false };
}
export interface TesterOptions extends Options {
    // Tester can only run on files stored on-disk.
    readonly definitelyTypedPath: string;
}

export function readDataFile(generatedBy: string, fileName: string): Promise<object> {
    return readFileAndWarn(generatedBy, dataFilePath(fileName));
}

/** If a file doesn't exist, warn and tell the step it should have been generated by. */
export async function readFileAndWarn(generatedBy: string, filePath: string): Promise<object> {
    try {
        return await readJson(filePath);
    } catch (e) {
        console.error(`Run ${generatedBy} first!`);
        throw e;
    }
}

export async function writeDataFile(filename: string, content: {}, formatted = true): Promise<void> {
    await ensureDir(dataDirPath);
    await writeJson(dataFilePath(filename), content, formatted);
}

export function dataFilePath(filename: string): string {
    return joinPaths(dataDirPath, filename);
}
