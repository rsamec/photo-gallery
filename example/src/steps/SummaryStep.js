import React from 'react';

const SummaryStep = React.createClass({
    render(){
        return (<div>
            <pre>{JSON.stringify(this.props.wizardData.value, null, 2)}</pre>
        </div>)
    }
});
export default SummaryStep;