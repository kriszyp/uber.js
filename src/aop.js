/*
 * AOP Advice
 * Use this to add "before" or "after" advice to methods. For examples:
 * var aop = require("pckg/aop");
 * var handle = aop.after(targetObject, "methodName", function(someArgument){
 * 	// this will be called when targetObject.methodName() is called, after the original function is called
 * });
 * 
 * handle.stop(); // this will stop the advice from being executed
 * handle.resume(); // this will resume the advice being executed
 * 
 * aop.before(targetObject, "methodName", function(someArgument){
 * 	// this will be called when targetObject.methodName() is called, before the original function is called
 * });
 * 
 */
 
"use strict";
define([], function(){
	function aspect(type){
		return function(target, methodName, advice){
			var existing = target[methodName];
			if(!existing || !existing.after){
				// no dispatcher in place
				var before = [], after = [], dispatcher = target[methodName] = function(){
					dispatch(before, this, arguments);
					// call the original method
					var result = existing && existing.apply(this, arguments);
					dispatch(after, this, arguments);
					return result;
				};
				function dispatch(list, target, args){
//					if(list){
						for(var i = 0; i < list.length; i++){
							list[i].apply(target, args);
						}
	//				}
				}
				function createAspect(type, list){
					dispatcher[type] = function(listener){
						var handle = {
							stop: function(){
								list.splice(list.indexOf(listener), 1);
							},
							resume: function(){
								list[type == "after" ? "push" : "unshift"](listener);
							}
						};
						handle.resume();
						return handle;
					};
				}
				createAspect("before", before);
				createAspect("after", after);
			}
			return (dispatcher || existing)[type](advice);
		};
	}
	return {
		after: aspect("after"),
		before: aspect("before")
	};
	
});