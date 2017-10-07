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
		const boundFunction = this.someMethod.bind(this, value, anotherValue);

		return (
			<button
				onClick={event => onSubmit(this.props.value, anotherValue, event)}
				onBlur={boundFunction}
				onFocus={function() { setTimeout(bar => console.log("focused!", foo, bar, value), 0) }}
			/>
		)
	} 
}
