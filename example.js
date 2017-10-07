class MyComponent {
	render() {
		const { onSubmit, value, anotherValue } = this.props;

		const wrappedMethod = () => this.someMethod(value);
		const boundMethod = this.someMethod.bind(this, value, anotherValue);

		return (
			<button
				onClick={event => onSubmit(value, anotherValue, event)}
				onBlur={boundMethod}
			/>
		)
	} 
}
