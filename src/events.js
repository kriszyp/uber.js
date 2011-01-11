/*
 * An events module built using very minimal code needed. The export of this module 
 * is a function that can be used to listen for events on a target:
 * listen = require("events");
 * listen(node, "click", clickHandler);
 * 
 * The export of this module can be used as a mixin, to add on() and emit() methods
 * for listening for events and dispatching events:
 * var Evented = require("events");
 * var EventedWidget = Compose(Evented, Widget);
 * widget = new EventedWidget();
 * widget.on("open", function(event){
 * 	... do something with event
 * });
 *
 * widget.emit("open", {name:"some event", ...});
 * 
 * You can also use listen function itself as a pub/sub hub:
 * listen("some/topic", function(event){
 * 	... do something with event
 * });
 * listen.publish("some/topic", {name:"some event", ...});
 */
 
"use strict";
define(["./aop"], function(aop){
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
	var undefinedThis = (function(){
		return this; // this depends on strict mode
	})();
	
	var listen = function(target, type, listener){
		if(this == undefinedThis || !this.on){
			if(!listener){
				// two args, do pub/sub
				return listen(listen, target, type);
			}
			// this is being called directly, not being used for compose
			if(target.on){ // delegate to the target's on() method
				return target.on(type, listener);
			}
			// call with two args, where the target is |this|
			return prototype.on.call(target, type, listener);
		}/*else{
			 being used as a mixin, don't do anything
		}*/
	};
	var prototype = listen.prototype;
	prototype.on = /*prototype.addListener = prototype.addEventListener = prototype.subscribe = prototype.connect = */
			function(/*target?,*/type, listener){
		// normal path, the target is |this|
		if(this.addEventListener){
			// the target has addEventListener, which should be used if available (might or might not be a node, non-nodes can implement this method as well)
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
		return aop.after(this, "on" + type, breakCycleLeak && this.nodeType ? 
			breakCycleLeak(listener) : // we have a DOM node and possibly a leaky GC, so we avoid 
			listener);
	};
	listen.publish = prototype.emit = /*prototype.publish = prototype.dispatchEvent = */function(type, event){
		type = "on" + type;
		this[type] && this[type](event);
	};
	return listen;
});
