/*
---

script: Element.Delegation.js

name: Element.Delegation

description: Extends the Element native object to include the delegate method for more efficient event management.

credits:
  - "Event checking based on the work of Daniel Steigerwald. License: MIT-style license.	Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
  - Aaron Newton
  - Daniel Steigerwald

requires:
  - Core/Element.Event
  - Core/Selectors
  - /MooTools.More

provides: [Element.Delegation]

...
*/

(function(addEvent, removeEvent){
	
	var splitType = function(type){
			var parsed = Slick.parse(type).expressions[0][0];
			return parsed.pseudos ? {
				event: parsed.tag,
				selector: parsed.pseudos[0].value
			} : {event: type};
		},
		
		check = function(e, selector){
			for (var target = e.target; target && target != this; target = target.parentNode)
				if (Slick.match(target, selector)) return document.id(target);
			return null;
		};

	Element.implement({

		addEvent: function(type, fn){
			var split = splitType(type);
			if (split.selector){
				var monitors = this.retrieve('delegation:_delegateMonitors', {});
				if (!monitors[type]){
					var monitor = function(e){
						var el = check.call(this, e, split.selector);
						if (el) this.fireEvent(type, [e, el], 0, el);
					}.bind(this);
					monitors[type] = monitor;
					addEvent.call(this, split.event, monitor);
				}
			}
			return addEvent.apply(this, arguments);
		},

		removeEvent: function(type, fn){
			var split = splitType(type);
			if (split.selector){
				var events = this.retrieve('events');
				if (!events || !events[type] || (fn && !events[type].keys.contains(fn))) return this;

				if (fn) removeEvent.apply(this, [type, fn]);
				else removeEvent.apply(this, type);

				events = this.retrieve('events');
				if (events && events[type] && events[type].keys.length == 0){
					var monitors = this.retrieve('delegation:_delegateMonitors', {});
					removeEvent.apply(this, [split.event, monitors[type]]);
					delete monitors[type];
				}
				return this;
			}
			return removeEvent.apply(this, arguments);
		},

		fireEvent: function(type, args, delay, bind){
			var events = this.retrieve('events');
			var e, el;
			if (args) {
				e = args[0];
				el = args[1];
			}
			if (!events || !events[type]) return this;
			events[type].keys.each(function(fn){
				if (delay) {
					fn.delay(delay, bind || this, args);
				} else {
					fn.apply(bind || this, args);
				}
			}, this);
			return this;
		}

	});

})(Element.prototype.addEvent, Element.prototype.removeEvent);
