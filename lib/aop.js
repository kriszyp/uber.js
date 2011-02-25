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
 * Note that "around" advice is not included in this module since it is so well supported 
 * natively in JavaScript. No should be using a library to provide "around" advice.
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
						list = list.slice();
						for(var i = 0; i < list.length; i++){
							var listener = list[i];
							if(!listener.paused){
								listener(target, args);
							}
						}
	//				}
				}
				function createAspect(type, list){
					dispatcher[type] = function(listener){
						var listenerCaller = function(target, args){
							listener.apply(target, args);
						}
						var handle = {
							stop: function(){
								list.splice(list.indexOf(listenerCaller), 1);
							},
							resume: function(){
								listenerCaller.paused = false;
							},
							pause: function(){
								listenerCaller.paused = true;
							}
						};
						list[type == "after" ? "push" : "unshift"](listenerCaller);
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