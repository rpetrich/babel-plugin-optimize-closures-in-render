var __render_cache = typeof WeakMap !== "undefined" && new WeakMap();

function __render_bind(target, nodeIndex, func, boundValues) {
	var targetCache;

	if (__render_cache) {
		(targetCache = __render_cache.get(target)) || __render_cache.set(target, targetCache = []);
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
}

var _passthrough = function () {
	return this.simpleMethod();
},
    _wrappingValue = function (value) {
	return this.someMethod(value);
},
    _reassigned = function () {
	return false;
},
    _onClick = function (onSubmit, value, anotherValue, event) {
	return onSubmit(this.props.value, anotherValue, event);
},
    _onFocus = function (value) {
	setTimeout(bar => console.log("focused!", foo, bar, value, value), 0);
},
    _div,
    _div2,
    _div3,
    _ul,
    _div4,
    _div5;

import * as React from "react";
import { ImportedComponent } from "some-react-library";

var foo;

function ChildComponent() {
	return _div || (_div = React.createElement(
		"div",
		null,
		"Test child"
	));
}

const constant = 1;
function shouldOptimize() {
	return _div2 || (_div2 = React.createElement(
		"div",
		null,
		constant
	));
}

function shouldNotOptimize(value) {
	return React.createElement(
		"div",
		null,
		value
	);
}

function shouldAlsoOptimize() {
	const copy = constant;
	return _div3 || (_div3 = React.createElement(
		"div",
		null,
		copy
	));
}

class MyComponent {
	simpleMethod() {}
	someMethod(foo, bar) {}
	render() {
		// Kind of silly, but represents all combinations
		const { value, anotherValue, onSubmit } = this.props;

		const passthrough = __render_bind(this, 0, _passthrough);
		const wrappingValue = __render_bind(this, 1, _wrappingValue, [this, value]);
		let reassigned = __render_bind(this, 2, this.someMethod, [this, value, anotherValue]);
		reassigned = _reassigned;

		return React.createElement(
			"div",
			null,
			React.createElement("button", {
				onClick: __render_bind(this, 4, _onClick, [this, onSubmit, value, anotherValue]),
				onBlur: boundFunction,
				onFocus: __render_bind(this, 5, _onFocus, [this, value])
			}),
			_ul || (_ul = React.createElement(
				"ul",
				null,
				React.createElement(
					"li",
					{ "class": "first" },
					"This"
				),
				React.createElement(
					"li",
					null,
					"is"
				),
				React.createElement(
					"li",
					null,
					"a"
				),
				React.createElement(
					"li",
					null,
					"static"
				),
				React.createElement(
					"li",
					{ "class": "last" },
					"list"
				)
			)),
			_div4 || (_div4 = React.createElement(
				"div",
				null,
				React.createElement(ChildComponent, null),
				React.createElement(ImportedComponent, null)
			))
		);
	}
}

var dom = require("dom");

function requireTest() {
	return _div5 || (_div5 = dom.h("div", null));
}
