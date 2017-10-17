var __render_bind = function () {
	var map = typeof WeakMap != "undefined" && new WeakMap();
	return function (target, nodeIndex, func, boundValues) {
		var targetCache;

		if (map) {
			(targetCache = map.get(target)) || map.set(target, targetCache = []);
		} else {
			targetCache = target.__render_cache || (target.__render_cache = []);
		}

		var nodeCache = targetCache[nodeIndex];

		if (nodeCache) {
			if (boundValues) {
				for (var i = 0; i < boundValues.length; i++) {
					if (nodeCache.v[i] !== boundValues[i]) {
						nodeCache.v = boundValues;
						return nodeCache._ = func.bind.apply(func, boundValues);
					}
				}
			}

			return nodeCache._;
		}

		var result = func.bind.apply(func, boundValues || [target]);
		targetCache[nodeIndex] = {
			v: boundValues,
			_: result
		};
		return result;
	};
}();

var _ref = function () {
	return this.simpleMethod();
},
    _ref2 = function (value) {
	return this.someMethod(value);
},
    _ref3 = function (onSubmit, value, anotherValue, event) {
	return onSubmit(this.props.value, anotherValue, event);
},
    _ref4 = function (value) {
	setTimeout(bar => console.log("focused!", foo, bar, value), 0);
};

var foo;

class MyComponent {
	simpleMethod() {}
	someMethod(foo, bar) {}
	render() {
		// Kind of silly, but represents all combinations
		const { value, anotherValue, onSubmit } = this.props;

		const passthrough = __render_bind(this, 0, _ref);
		const wrappingValue = __render_bind(this, 1, _ref2, [this, value]);
		const boundFunction = __render_bind(this, 2, this.someMethod, [this, value, anotherValue]);

		return React.createElement("button", {
			onClick: __render_bind(this, 3, _ref3, [this, onSubmit, value, anotherValue]),
			onBlur: boundFunction,
			onFocus: __render_bind(this, 4, _ref4, [this, value])
		});
	}
}

