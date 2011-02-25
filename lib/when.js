define([], function(){
    return function when(promiseOrValue, callback, errback, progressHandler){
        if(promiseOrValue && typeof promiseOrValue.then == "function"){
            return promiseOrValue.then(callback, errback);
        }
        return callback(promiseOrValue);
    }
});
