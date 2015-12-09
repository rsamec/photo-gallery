import React from 'react';
import ImageGallery from 'photo-gallery';
import {HtmlPagesRenderer} from 'react-page-renderer';
import Core from 'react-designer-widgets';
import BindToMixin from 'react-binding';
import _ from 'lodash';
import SplitPane from 'react-split-pane';
import flux from 'fluxify';

//steps
import SelectGalleryStep from './steps/SelectGalleryStep';
import PageSizeStep from './steps/PageSizeStep';
import BackgroundStep from './steps/BackgroundStep';
import PageLayoutStep from './steps/PageLayoutStep';
import SummaryStep from './steps/SummaryStep';
import SplashScreenStep from './steps/SplashScreen';

import UserLogin from './login/UserLogin';

var Widgets = {
    'Core.ImageBox': Core.ImageBox,
    'Core.ImageCarousel': Core.ImageCarousel,
    'Core.ImagePanel': Core.ImagePanel,
    'Core.Flipper': Core.Flipper
};
var reloadAlbum = function (url, imageSize, successCallback) {

    $.ajax({
        dataType: 'jsonp',
        url: url,
        data: {
            alt: 'json-in-script'
        },
        jsonpCallback: 'picasaCallback',
        success: function (data) {
            var photos = [];
            $.each(data.feed.entry, function () {

                if (imageSize === undefined || imageSize === 'original') {
                    photos.push(this.media$group.media$content[0]);
                }
                else {
                    var size;
                    switch (imageSize) {
                        case "small":
                            size = 1;
                            break;
                        case "middle":
                            size = 2;
                            break;
                        default:
                            size = 0;
                            break;

                    }
                    photos.push(this.media$group.media$thumbnail[size]);
                }

            });
            successCallback(photos);
        },
        error: function () {
            alert("failed");
        }
    })
}
var photoStore = flux.createStore({

    id: 'formStore',
    initialState: {
        publicAlbums: [],
        privateAlbums: []
    },
    actionCallbacks: {
        userLoaded: function (updater, currentUser) {
            if (currentUser === undefined) {
                updater.set({privateAlbums: undefined,user: undefined});
                return;
            }


            var url = 'https://picasaweb.google.com/data/feed/api/user/' + currentUser.id;
            $.ajax({
                dataType: 'jsonp',
                url: url,
                data: {
                    alt: 'json-in-script'
                },
                jsonpCallback: 'picasaCallback',
                success: function (data) {
                    var photos = [];
                    var albums = [];
                    $.each(data.feed.entry, function (item) {
                        albums.push({
                            name: this.title.$t,
                            url: this.link[0].href,
                            coverImageUrl: this.media$group.media$content[0].url
                        });
                        //console.log(item);

                    });
                    updater.set({privateAlbums: albums, user: currentUser});
                    //console.log(albums);
                },
                error: function () {
                    alert("failed");
                }
            })
            //console.log(currentUser);

        },
        selectAlbum: function (updater, album) {
            reloadAlbum(album.url, 'original', (photos) => {
                updater.set({
                    selectedAlbum: _.extend(_.clone(album), {photos: photos}),
                    albumChanged:true
                })
            });
        },
        changeImageSize: function (updater, imageSize) {
            var album = photoStore.selectedAlbum;
            reloadAlbum(album.url, imageSize, (photos) => {
                updater.set({
                    selectedAlbum: _.extend(_.clone(album), {photos: photos})
                })
            });
        },
        generateAlbum(updater,item,wizardData,type){
            if (type === undefined) type = "pdf";
            var album = item.name;

            reloadAlbum(album.url, 'original', (photos) => {
                var imageGallery = new ImageGallery(album.name, photos, wizardData.layoutTemplate, wizardData.pageOptions);
                var contentType = 'image/' + type;
                if (type === "pdf") contentType = 'application/pdf';
                var url = 'http://render-pergamon.rhcloud.com';
                //var url = 'http://localhost:8080';
                //var name = this.context.router.getCurrentParams().name;

                var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
                xmlhttp.open("POST", url + '/' + type);

                //xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
                xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xmlhttp.responseType = 'arraybuffer';

                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        var blob = new Blob([xmlhttp.response], {type: contentType});
                        var fileURL = URL.createObjectURL(blob);
                        window.open(fileURL);
                    }
                };

                xmlhttp.send(JSON.stringify(_.extend(imageGallery.generate(), {
                    pageOptions: wizardData.pageOptions
                })));
            });
        }
    },

});

function getNavStates(indx, length) {
    let styles = []
    for (let i = 0; i < length; i++) {
        if (i < indx) {
            styles.push('done')
        }
        else if (i === indx) {
            styles.push('doing')
        }
        else {
            styles.push('todo')
        }
    }
    return {current: indx, styles: styles}
}

const Multistep = React.createClass({
    getInitialState() {
        return {
            compState: 0,
            navState: getNavStates(0, this.props.steps.length)
        }
    },

    setNavState(next) {
        this.setState({navState: getNavStates(next, this.props.steps.length)});
        if (next < this.props.steps.length) {
            this.setState({compState: next})
        }
    },

    handleOnClick(evt) {
        if (evt.target.value === this.props.steps.length - 1 &&
            this.state.compState === this.props.steps.length - 1) {
            this.setNavState(this.props.steps.length);
        }
        else {
            this.setNavState(evt.target.value);
        }
    },

    handleKeyDown(evt) {
        if (evt.which === 13) {
            this.setNavState(this.state.compState + 1);
        }
    },

    render() {
        return (
            <SplitPane split="horizontal" defaultSize={70} minSize="50">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-around',width:'100%'}}>
                    <div style={{marginLeft:20}}>
                        <img src="/images/paperify-logo-48.png" alt="PAPERIFY" onClick={this.props.paperify}/>
                    </div>
                    <div >

                        <div onKeyDown={this.handleKeyDown}>
                            <ol className="progtrckr">{
                                this.props.steps.map((s, i) =>
                                    <li value={i} key={i}
                                        className={"progtrckr-" + this.state.navState.styles[i]}
                                        onClick={this.handleOnClick}>
                                        <em>{i + 1}</em>
                                        <span>{this.props.steps[i].name}</span>
                                    </li>
                                )}
                            </ol>
                        </div>


                    </div>
                    <div>{!!this.props.selectedAlbum ? this.props.selectedAlbum.name : 'No album selected'}</div>
                    <div className="pull-right">
                        <UserLogin />
                    </div>
                </div>
                {this.state.compState !== 0 ?
                    <SplitPane split="vertical" defaultSize={350} minSize="200">
                        <div style={{margin:10}}>{this.props.steps[this.state.compState].component}</div>
                        <div style={{margin:5}}>{this.props.workplace}</div>
                    </SplitPane> :
                    this.props.steps[this.state.compState].component
                }
            </SplitPane>
        )
    }
})


const ImageGalleryView = React.createClass({
    mixins: [BindToMixin],
    getInitialState(){
        return {zoomFactor: 1}
    },

    render(){
        if (this.props.photos === undefined) return (<div>Loading...</div>);

        var gallery = new ImageGallery("ImageGallery", this.props.photos, this.props.layoutTemplate, this.props.pageOptions);
        var schema = gallery.generate();
        var style = {boxSizing: 'border-box', position: 'fixed', bottom: 0, right: 0, margin: 20, zIndex: 1000};

        var buttonStyle = {
            width: 55,
            height: 55,
            background: '#265a88',
            padding: 17,
            borderRadius: '100',
            color: 'white',
            textAlign: 'center',
            margin: 10
        };


        return (
            <div>
                <div style={style}>
                    <div style={buttonStyle} onClick={()=> {this.setState({zoomFactor: this.state.zoomFactor / 0.9})}}>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                    </div>
                    <div style={buttonStyle} onClick={()=> {this.setState({zoomFactor: this.state.zoomFactor * 0.9})}}>
                        <span className="glyphicon glyphicon-minus" aria-hidden="true"></span>
                    </div>
                </div>
                <div style={{zoom:this.state.zoomFactor}}>
                    <HtmlPagesRenderer widgets={Widgets} schema={schema} data={{}}
                                       pageOptions={this.props.pageOptions}/>
                </div>
            </div>);
    }
});

const DEFAULT_FLEX_ITEM:IFlexItem = {
    order: 0,
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    alignSelf: 'auto'
};
const DEFAULT_FLEX_CONTAINER:IFlexContainerTemplate = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    alignContent: 'stretch'
};
const defaultWizardData = {
    imageSize: 'original',
    layoutTemplate: {
        Container: DEFAULT_FLEX_CONTAINER,
        Item: DEFAULT_FLEX_ITEM
    },
    pageOptions: {
        width: 730,
        height: 1200,
        imagesPerPage: 2,
        background: {}
    }
};

const App = React.createClass({
    mixins: [BindToMixin],
    getInitialState(){
        return {
            loaded: false,
            wizardData: defaultWizardData
        }
    },
    componentDidMount() {
        var me = this;

        photoStore.on('change:privateAlbums', function (value) {
            me.setState({
                albums: value
                //    loaded: true
            });
        });

        photoStore.on('change:selectedAlbum', function (value) {

            me.setState({
                selectedAlbum: value
            });
        });
        photoStore.on('change:selectedAlbum.name', function (value) {
            console.log('name changed: ' + value)
        });
    },
    //generate(type){
    //    type = "pdf";
    //    var contentType = 'image/' + type;
    //    if (type === "pdf") contentType = 'application/pdf';
    //    var url = 'http://render-pergamon.rhcloud.com';
    //    //var url = 'http://localhost:8080';
    //    //var name = this.context.router.getCurrentParams().name;
    //
    //    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    //    xmlhttp.open("POST", url + '/' + type);
    //
    //    //xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
    //    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    //    xmlhttp.responseType = 'arraybuffer';
    //
    //    xmlhttp.onreadystatechange = function () {
    //        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    //            var blob = new Blob([xmlhttp.response], {type: contentType});
    //            var fileURL = URL.createObjectURL(blob);
    //            window.open(fileURL);
    //        }
    //    };
    //
    //    var schema = this.createSchema();
    //
    //    xmlhttp.send(JSON.stringify(_.extend(schema, {
    //        pageOptions: this.state.wizardData.pageOptions
    //    })));
    //},
    createSchema(){
        var gallery = new ImageGallery("ImageGallery", this.state.photos, this.state.wizardData.layoutTemplate, this.state.wizardData.pageOptions);
        return gallery.generate();
    },
    render() {
        var wizardData = this.bindToState('wizardData');

        var steps = [
            {name: 'Select album', component: <SplashScreenStep albums={this.state.albums} wizardData={wizardData}/>},
            {name: 'Layout', component: <SelectGalleryStep wizardData={wizardData}/>},
            {name: 'Page size', component: <PageSizeStep wizardData={wizardData}/>},
            {name: 'Background', component: <BackgroundStep wizardData={wizardData}/>},
            {name: 'Layout', component: <PageLayoutStep wizardData={wizardData}/>},
            {name: 'Image', component: <PageLayoutStep wizardData={wizardData}/>},
            {name: 'Finish', component: <SummaryStep wizardData={wizardData}/>}
        ];

        return (
            <div>
                <Multistep selectedAlbum={this.state.selectedAlbum} steps={steps}
                           workplace={this.state.selectedAlbum === undefined ? "Select album first" :<ImageGalleryView pageOptions={this.state.wizardData.pageOptions} layoutTemplate={this.state.wizardData.layoutTemplate} photos={this.state.selectedAlbum.photos} />}/>

            </div>
        );


    }
});

React.render(<App />, document.getElementById('app'));
