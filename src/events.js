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
(function(define){
define(, function(Compose){
	// aspect applier 
	function aspect(handler){
		return function(target, methodName, advice){
			if(!advice){
				if(methodName){
					advice = methodName;
					methodName = target;
				}else{
					// single argument, creating a decorator
					advice = target;
					return Decorator(install);
				}
				target = this;
			}
			install.call(target, methodName);
			/*return {
				cancel: function(){
				// TODO: Add cancel method	
				}
			}*/
			function install(key){
				var baseMethod = this[key];
				if(baseMethod && !(baseMethod.install)){
					// if(baseMethod.around){
					// if(baseMethod.around(handler, advice);
					//}
					// applying to a plain method
					this[key] = handler(this, baseMethod, advice);
				}else{
					this[key] = Compose.around(function(topMethod){
						baseMethod && baseMethod.install.call(this, key);
						return handler(this, this[key], advice);
					});
				}
			}
		};
	};
	// around advice, useful for calling super methods too
	Compose.around = aspect(function(target, base, advice){
		return advice.call(target, base);
	});
	Compose.before = aspect(function(target, base, advice){
		return function(){
			var results = advice.apply(target, arguments);
			return base.apply(target, results || arguments);
		};
	});
	var undefined;
	var after = Compose.after = aspect(function(target, base, advice){
		return function(){
			var results = base.apply(target, arguments);
			var adviceResults = advice.apply(target, arguments);
			return adviceResults === undefined ? results : adviceResults;
		};
	});
	var breakCycleLeak;
	var has = function(){ 
		return typeof navigator == "undefined" || navigate.userAgent.indexOf("Trident") == -1;  
	};
	if(has("decent-gc")){
		// intentionally a global to break IE memory leaks 
		__cache__ = {}; 
		var nextId = 1;
		breakCycleLeak = function(listener){
			var eventId = nextId++;
			__cache__[eventId] = listener;
			return function(){
				if(eventId in __cache__ && __cache__[eventId]){
                	__cache__[id].apply(this, arguments);
	            }
			};	
		}
	}
	var prototype = {};
	var on = prototype.on = /*prototype.addListener = prototype.addEventListener = prototype.subscribe = prototype.connect = */function(/*target?,*/type, listener, listenerForTarget){
		if(listenerForTarget){
			if(type.on){
				return target.on(type, listener);
			}
			return on.call(target, type, listener);
		}
		if(this.addEventListener){
			var node = this;
			var signal = {
				stop: function(){
					node.removeEventListener(type, listener, false);
				},
				resume: function(){
					node.addEventListener(type, listener, false);
				}
			};
			signal.resume();
			return signal;
		}
		return after(this, "on" + type, breakCycleLeak && this.nodeType ? 
			breakCycleLeak(listener) : // we have a DOM node and possibly a leaky GC, so we avoid 
			listener);
	};
	prototype.emit = /*prototype.publish = prototype.dispatchEvent = */function(type, event){
		type = "on" + type;
		this[type] && this[type](event);
	};
	var Evented = Compose(prototype);
	for(var i in prototype){
		Evented[i] = prototype[i];
	}
	return Evented;
});
})(typeof define != "undefined" ?
	define: // AMD/RequireJS format if available
	function(deps, factory){
		if(typeof module !="undefined"){
			module.exports = factory(require("./compose")); // CommonJS environment, like NodeJS
		}else{
			factory(Compose); // raw script, assign to Compose global
		}
	});
	