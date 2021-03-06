---
sidebar_position: 6
---

```javascript
class MyPromise {
    
    constructor(func) {
        this.PromiseState = 'pending';
        this.PromiseResult = null;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
        try {
            func(this.resolve.bind(this), this.reject.bind(this));
        } catch (e) {
            this.reject(e)
        }
    }

    resolve(value) {
        if (this.PromiseState === 'pending') {
            setTimeout(() => {
                this.PromiseState = 'fulfilled';
                this.PromiseResult = value;
                this.onFulfilledCallbacks.forEach(callback => callback(value))
            })
        }
    }

    reject(reason) {
        if (this.PromiseState === 'pending') {
            setTimeout(() => {
                this.PromiseState = 'rejected';
                this.PromiseResult = reason;
                this.onRejectedCallbacks.forEach(callback => callback(reason))
            })
        }
    }


    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : reason => {
            throw reason
        };
        let promise2 = new MyPromise((resolve, reject) => {
            if (this.PromiseState === 'fulfilled') {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.PromiseResult);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                })
            }
            if (this.PromiseState === 'rejected') {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.PromiseResult);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                })
            }
            if (this.PromiseState === 'pending') {
                this.onFulfilledCallbacks.push(() => {
                    try {
                        let x = onFulfilled(this.PromiseResult);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                });
                this.onRejectedCallbacks.push(() => {
                    try {
                        let x = onRejected(this.PromiseResult);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                });
            }
        })
        return promise2;
    }

    // catch
    catch(onRejected) {
        return this.then(undefined, onRejected);
    }

    // finally
    finally(callback) {
        let P = this.constructor;
        return this.then(
            value  => P.resolve(callback()).then(() => value),
            reason => P.resolve(callback()).then(() => { throw reason })
        );
    }
    
    // resolve
    static resolve(value) {
        if (value instanceof MyPromise) {
            return value;
        } else if (value instanceof Object && then in value) {
            return new MyPromise((resolve, reject) => {
                value.then(resolve, reject);
            })
        }
        return new MyPromise((resolve) => {
            resolve(value);
        })
    }
    
    // reject
    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason);
        })
    }
    
    // all
    // ???????????? promise ??? reject ?????????????????? reject ????????? reject ?????????????????????????????????????????????????????? promise ??? resolve ????????? resolve ???????????????
    static all(promises) {
        return new MyPromise((reslove, reject) => {
            if (Array.isArray(promises)) {
                let count = 0;
                let result = [];
                if (promises.length === 0) {
                    resolve(promises);
                }
                promises.forEach((item, index) => {
                    if (item instanceof MyPromise) {
                        MyPromise.resolve(item).then(
                            (value) => {
                                count++;
                                result[index] = value;
                                count === promises.length && resolve(result);
                            },
                            (reason) => {
                                reject(reason);
                            },
                        )
                    } else {
                        count++;
                        result[index] = item;
                        count === promises.length && resolve(result);
                    }
                })
            } else {
                return reject(new TypeError('arguments is not iterable'));
            }
        })
    }
    
    // allSettled
    static allSettled(promises) {
        return new MyPromise((reslove, reject) => {
            if (Array.isArray(promises)) {
                let count = 0;
                let result = [];
                if (promises.length === 0) {
                    resolve(promises);
                }
                promises.forEach((item, index) => {
                    MyPromise.resolve(item).then(
                        (value) => {
                            count++;
                            result[index] = {
                                status: 'fulfilled',
                                value
                            }
                            count === promises.length && resolve(result);
                        },
                        (reason) => {
                            count++;
                            result[index] = {
                                status: 'rejected',
                                reason
                            }
                            count === promises.length && resolve(result);
                        },
                    )
                })
            } else {
                return reject(new TypeError('arguments is not iterable'))
            }
        })
    }

    // any
    // ????????????????????? promise ??????????????????????????????????????? promise
    // ???????????????????????????????????? promise ????????????????????? promises ?????????/???????????????????????????????????? promise ??? AggregateError ???????????????????????? Error ?????????????????????????????????????????????????????????
    static any(promises) {
        return new MyPromise((resolve, reject) => {
            if (Array.isArray(promises)) {
                let count = 0;
                let errors = [];
                if (promises.length === 0) {
                    return reject(new AggregateError('All promises were rejected'));
                }
                promises.forEach((item, index) => {
                    MyPromise.resolve(item).then(
                        (value) => {
                            resolve(value);
                        },
                        (reason) => {
                            count++;
                            errors.push(reason);
                            count === promises.length && reject(new AggregateError(errors))
                        },
                    )
                })
            } else {
                return reject(new TypeError('arguments is not iterable'));
            }
        })
    }

    // race
    static race(promsies) {
        return new MyPromise((resolve, reject) => {
            if (Array.isArray(promsies)) {
                if (promsies.length > 0) {
                    promsies.forEach((item) => {
                        MyPromise.resolve(item).then(resolve, reject);
                    })
                }
            } else {
                return reject(new TypeError('arguments is not iterable'));
            }
        })
    }
}


function resolvePromise(promise2, x, resolve, reject) {
    if (x === promise2) {
        return reject(new TypeError('Chaining cycle detected for promise'));
    }
    if (x instanceof MyPromise) {
        if (x.PromiseState === 'pending') {
            x.then(
                y => {
                    resolvePromise(promise2, y, resolve, reject);
                },
                reject
            )
        } else if (x.PromiseState === 'fulfilled') {
            resolve(x.PromiseResult);
        } else if (x.PromiseState === 'rejected') {
            reject(x.PromiseResult);
        }
    } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        let then;
        try {
            then = x.then;
        } catch (e) {
            return reject(e);
        }
        if (typeof then === 'function') {
            let called = false;
            try {
                then.call(
                    x,
                    y => {
                        if (called) return;
                        called = true;
                        resolvePromise(promise2, y, resolve, reject);
                    },
                    r => {
                        if (called) return;
                        called = true;
                        reject(r);
                    },
                )
            } catch (e) {
                if (called) return;
                called = true;
                reject(e);
            }
        } else {
            resolve(x);
        }
    } else {
        return resolve(x);
    }
}
```

```javascript
// promise ????????????????????????

let promise = new Promise((resolve, reject) => {
    resolve('First resolve');
});

// 1. ??????return????????????
promise.then((res) => {
    return res; // ?????????????????????
}).then((res) => {
    console.log(res); // First resolve
});

// 2. ????????????promsise resolve??????
promise.then((res) => {
    return res; // ?????????????????????
}).then((res) => {
    return new Promise((resolve, reject) => {// ????????????promise??????
        resolve(res);
    });
}).then((res) => {
    console.log(res); // First resolve
})

// 3. ????????????promsise reject??????
promise.then((res) => {
    return res; // ?????????????????????
}).then((res) => {
    return new Promise((resolve, reject) => {// ????????????promise??????
        reject('ERROR');
    });
}).then(
    (res) => {
        console.log(res);
    },
    (reason) => {
        console.log(reason); // ERROR
    }
)

// 4. then??????????????????????????????then
promise.then((res) => {
    return res; // ?????????????????????
}).then((res) => {
    return new Promise((resolve, reject) => {// ????????????promise??????
        reject('ERROR');
    });
}).then(
    (res) => {
        console.log(res);
    },
    (reason) => {
        console.log(reason); // ERROR
        // ??????return undefined
    }
).then(
    (res) => {
        console.log(res); // undefind
    },
    (reason) => {
        console.log(reason);
    }
)

// 4. then???throw new Error
promise.then((res) => {
    return res; // ?????????????????????
}).then((res) => {
    return new Promise((resolve, reject) => {// ????????????promise??????
        reject('ERROR');
    });
}).then(
    (res) => {
        console.log(res);
    },
    (reason) => {
        console.log(reason); // ERROR
        // ??????return undefined
    }
).then(
    (res) => {
        throw new Error('throw error');
    },
).then(
    (res) => {
        console.log(res);
    },
    (reason) => {
        console.log(reason); // throw error
    }
)


// 5. ???catch????????????
// catch???promise???????????????????????????then
promise.then((res) => {
    return res; // ?????????????????????
}).then((res) => {
    return new Promise((resolve, reject) => {// ????????????promise??????
        reject('ERROR');
    });
}).then(
    (res) => {
        console.log(res);
    },
    (reason) => {
        console.log(reason); // ERROR
        // ??????return undefined
    }
).then(
    (res) => {
        throw new Error('throw error');
    },
).then(
    (res) => {
        console.log(res);
    }
).catch((err) => {
    console.log(err); // throw error
});
```