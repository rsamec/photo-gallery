import React from 'react';
import BindToMixin from 'react-binding';
import InputRange from 'react-input-range';
import ColorPicker from 'react-colorpickr';

const BackgroundStep = React.createClass({
    mixins: [BindToMixin],
    render(){
        var backgroundColor = this.bindTo(this.props.wizardData, 'pageOptions.background.color');
        return (<div>

            <div className="form-group">
                <label>Color</label>
                <div>
                    <ColorPicker value={backgroundColor.value}
                                 onChange={(value)=>{backgroundColor.value = "#" + value.hex}}/>
                </div>
            </div>
            <BackgroundEffectsStep filter={this.bindTo(this.props.wizardData,'pageOptions.background.filter')}/>
        </div>)
    }
});
const BackgroundEffectsStep = React.createClass({
    mixins: [BindToMixin],
    render(){
        var blur = this.bindTo(this.props.filter, 'blur');
        var brightness = this.bindTo(this.props.filter, 'brightness');
        var contrast = this.bindTo(this.props.filter, 'contrast');
        var grayscale = this.bindTo(this.props.filter, 'grayscale');
        var hueRotate = this.bindTo(this.props.filter, 'hueRotate');
        var opacity = this.bindTo(this.props.filter, 'opacity');
        var saturate = this.bindTo(this.props.filter, 'saturate');


        return (<div>

            <div className="form-group">
                <label>Blur</label>
                <div>
                    <InputRange
                        className="form-control"
                        maxValue={100}
                        minValue={0}
                        value={blur.value}
                        onChange={(comp, value)=>{blur.value = value}}
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Brightness</label>
                <div>
                    <InputRange
                        className="form-control"
                        maxValue={100}
                        minValue={0}
                        value={brightness.value}
                        onChange={(comp, value)=>{brightness.value = value}}
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Contrast</label>
                <div>
                    <InputRange
                        className="form-control"
                        maxValue={100}
                        minValue={0}
                        value={contrast.value}
                        onChange={(comp, value)=>{contrast.value = value}}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Grayscale</label>
                <div>
                    <InputRange
                        className="form-control"
                        maxValue={100}
                        minValue={0}
                        value={grayscale.value}
                        onChange={(comp, value)=>{grayscale.value = value}}
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Hue</label>
                <div>
                    <InputRange
                        className="form-control"
                        maxValue={100}
                        minValue={0}
                        value={hueRotate.value}
                        onChange={(comp, value)=>{hueRotate.value = value}}
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Opacity</label>
                <div>
                    <InputRange
                        className="form-control"
                        maxValue={100}
                        minValue={0}
                        value={opacity.value}
                        onChange={(comp, value)=>{opacity.value = value}}
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Saturation</label>
                <div>
                    <InputRange
                        className="form-control"
                        maxValue={100}
                        minValue={0}
                        value={saturate.value}
                        onChange={(comp, value)=>{saturate.value = value}}
                    />
                </div>
            </div>

        </div>)
    }
});
export default BackgroundStep;