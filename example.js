import * as React from "react";

var foo;

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
					onFocus={function() { setTimeout(bar => console.log("focused!", foo, bar, value), 0) }}
				/>
				<ul>
					<li class="first">This</li>
					<li>is</li>
					<li>a</li>
					<li>static</li>
					<li class="last">list</li>
				</ul>
			</div>
		)
	} 
}
