var __render_pending,
    __render_lookup = function () {
	var map;

	if (typeof WeakMap != "undefined") {
		map = new WeakMap();
	}

	return function (target, nodeIndex, expectedValues) {
		var targetCache = map ? map.get(target) || map.set(target, []) : target.__render_cache || (target.__render_cache = []);
		var nodeCache = targetCache[nodeIndex];

		if (expectedValues && nodeCache) {
			for (var i = 0; i < expectedValues.length; i++) {
				if (nodeCache.v[i] !== expectedValues[i]) {
					nodeCache = 0;
					break;
				}
			}
		}

		if (nodeCache) {
			return nodeCache._;
		}

		__render_pending = targetState[nodeIndex] = {
			v: expectedValues
		};
	};
}();

var foo;

class MyComponent {
	simpleMethod() {}
	someMethod(foo, bar) {}
	render() {
		// Kind of silly, but represents all combinations
		const { value, anotherValue, onSubmit } = this.props;

		const passthrough = __render_lookup(this, 0) || (__render_pending._ = () => this.simpleMethod());
		const wrappingValue = __render_lookup(this, 1, [value]) || (__render_pending._ = () => this.someMethod(value));
		const boundFunction = __render_lookup(this, 2, [value, anotherValue]) || (__render_pending._ = this.someMethod.bind(this, value, anotherValue));

		return React.createElement("button", {
			onClick: __render_lookup(this, 3, [onSubmit, anotherValue]) || (__render_pending._ = event => onSubmit(this.props.value, anotherValue, event)),
			onBlur: boundFunction,
			onFocus: __render_lookup(this, 4, [value]) || (__render_pending._ = function () {
				setTimeout(bar => console.log("focused!", foo, bar, value), 0);
			})
		});
	}
}

