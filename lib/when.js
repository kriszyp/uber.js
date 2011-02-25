(function(define){
define(["./Deferred"], function(Deferred){

    var FN = "function";

    function when(promiseOrValue, callback, errback, progressHandler){
        if(promiseOrValue && typeof promiseOrValue.then == FN){
            return promiseOrValue.then(callback, errback, progressHandler);
        }
        return callback(promiseOrValue);
    }

    function these(promisesOrValues, callback, errback, progressHandler, rejectOnError){
        function addResult(succeeded, result, index){
            results[index] = [succeeded, result];
            finished++;
            if(finished === total){
                callback(results);
            }
        }

        var total, results, finished, defd;

		promisesOrValues = promisesOrValues.slice();
        total = promisesOrValues.length;

        if(total === 0){
            callback([0, []]);
            return;
        }

        total = promisesOrValues.length;
        results = [];
        finished = 0;
        defd = new Deferred;

        for(var i = 0; i < promisesOrValues.length; i++){
        	var pv = promisesOrValues[i];
            when(
                pv,
                function(result){
                    addResult(true, result, i);
                },
                function(error){
                    if(rejectOnError){
                        finished = total;
                        errback([i, error]);
                    }else{
                        addResult(false, error, i);
                    }
                    throw error;
                },
                function(update){
                    progressHandler([i, update]);
                }
            );
        }

        return;
    }

    when.these = these;

    return when;
});
})(typeof define != "undefined" ? define : function(deps, factory){
    this.uber_when = factory(uber_Deferred, uber_array); // use global uber_when
});
