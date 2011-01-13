/*
 * An events module built using very minimal code needed. The export
 * of this module can be used as a mixin:
 * var EventedWidget = Compose(Evented, Widget);
 * widget = new EventedWidget();
 * widget.on("open", function(event){
 * 	... do something with event
 * });
 *
 * widget.emit("open", {name:"some event", ...});
 * 
 * You can also use Evented constructor itself as a pub/sub hub:
 * Evented.on("some/topic", function(event){
 * 	... do something with event
 * });
 * Evented.emit("some/topic", {name:"some event", ...});
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