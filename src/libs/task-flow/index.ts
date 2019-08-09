import { Operation, AsyncOperation, SyncOperation } from "./types";
import { of } from "rxjs";
import { first } from "rxjs/operators";

export function operator<Arguments extends any[], Result>(operation: Operation<Arguments, Result>, isAsync: boolean = false) {
    const operate = isAsync
        ? operation as AsyncOperation<Arguments, Result>
        : (...args: Arguments) => of((operation as SyncOperation<Arguments, Result>)(...args));
    return (...args: Arguments) => () => operate(...args).pipe(first());
}

export function operate<Arguments extends any[], Result>(operation: Operation<Arguments, Result>, isAsync: boolean = false) {
    const operate = isAsync
        ? operation as AsyncOperation<Arguments, Result>
        : (...args: Arguments) => of((operation as SyncOperation<Arguments, Result>)(...args));
    return (...args: Arguments) => operate(...args).pipe(first());
}
