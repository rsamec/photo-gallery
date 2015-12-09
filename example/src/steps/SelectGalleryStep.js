import React from 'react';
import BindToMixin from 'react-binding';
import InputRange from 'react-input-range';
import PageSizes from '../utils/pageSizes';
import flux from 'fluxify';

const SelectImageGalleryStep = React.createClass({
    mixins: [BindToMixin],
    changeProp(propName, propValue){
        this.bindTo(this.props.wizardData, propName).value = propValue;
        flux.doAction('changeImageSize',propValue);
    },
    changePageSize(format){
        var pageSize = PageSizes[format];
        if (pageSize === undefined) return;

        this.bindTo(this.props.wizardData, 'pageOptions.width').value = Math.round((pageSize[0] / 72) * 96, 0);
        this.bindTo(this.props.wizardData, 'pageOptions.height').value = Math.round((pageSize[1] / 72) * 96, 0);
    },
    render(){
        var imagesPerPageLink = this.bindTo(this.props.wizardData, 'pageOptions.imagesPerPage');
        var pageOptions = this.props.wizardData.value.pageOptions;
        return (<div>

            <div className="form-group">
                <label>Images per page:<b>{imagesPerPageLink.value}</b></label>
                <div>
                    <InputRange
                        className="form-control"
                        maxValue={20}
                        minValue={0}
                        value={imagesPerPageLink.value}
                        onChange={(comp, value)=>{imagesPerPageLink.value = value}}
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Image size:<b>{this.bindTo(this.props.wizardData, 'imageSize').value}</b></label>
                <div className="btn-group" role="group" aria-label="...">
                    <button type="button" className="btn btn-primary" onClick={()=>this.changeProp('imageSize','original')}>original</button>
                    <button type="button" className="btn btn-primary" onClick={()=>this.changeProp('imageSize','mini')}>mini</button>
                    <button type="button" className="btn btn-primary" onClick={()=>this.changeProp('imageSize','small')}>small</button>
                    <button type="button" className="btn btn-primary" onClick={()=>this.changeProp('imageSize','middle')}>middle</button>
                </div>
            </div>

            <div className="form-group">
                <label>Page size:<b>{pageOptions.width} * {pageOptions.height}</b></label>
                <div className="btn-group" role="group" aria-label="...">
                    {
                        [1,2,3,4,5,6,7,8,9,10].map(function(item,index){return  <button type="button" className="btn btn-primary" onClick={()=>this.changePageSize('A' + item)}>A{item}</button>},this)
                    }
                </div>
                <br />
                <div className="btn-group" role="group" aria-label="...">
                    <button type="button" className="btn btn-primary" onClick={()=>this.changePageSize('FOLIO')}>Folio</button>
                    <button type="button" className="btn btn-primary" onClick={()=>this.changePageSize('LEGAL')}>Legal</button>
                    <button type="button" className="btn btn-primary" onClick={()=>this.changePageSize('TABLOID')}>Tabloid</button>
                    <button type="button" className="btn btn-primary" onClick={()=>this.changePageSize('LETTER')}>Letter</button>
                </div>
            </div>
        </div>);
    }
});
export default SelectImageGalleryStep;