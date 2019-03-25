import * as React from "react";
import { ImportedComponent } from "some-react-library";

var foo;

function ChildComponent() {
	return <div>Test child</div>;
}

const constant = 1;
function shouldOptimize() {
	return <div>{constant}</div>;
}

function shouldNotOptimize(value) {
	return <div>{value}</div>;
}

function shouldAlsoOptimize() {
	const copy = constant;
	return <div>{copy}</div>;
}

function receiveRef(ref) {
}

class MyComponent {
	simpleMethod() {
	}
	someMethod(foo, bar) {
	}
	render() {
		// Kind of silly, but represents all combinations
		const { value, anotherValue, onSubmit } = this.props;

		const passthrough = () => this.simpleMethod();
		const wrappingValue = () => this.someMethod(value);
		let reassigned = this.someMethod.bind(this, value, anotherValue);
		reassigned = () => false;

		return (
			<div>
				<button
					onClick={event => onSubmit(this.props.value, anotherValue, event)}
					onBlur={boundFunction}
					onFocus={function() { setTimeout(bar => console.log("focused!", foo, bar, value, value), 0) }}
				/>
				<ul>
					<li class="first">This</li>
					<li>is</li>
					<li>a</li>
					<li>static</li>
					<li class="last">list</li>
				</ul>
				<div>
					<ChildComponent/>
					<ImportedComponent/>
				</div>
				<div ref={receiveRef}/>
				<div notKeyOrRef="shouldCache"/>
				<div key="shouldNotCache"/>
			</div>
		)
	} 
}

var dom = require("dom");

function requireTest() {
	return dom.h("div", null);
}
