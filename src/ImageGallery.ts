import {chunk,map,clone,extend} from 'lodash';
import FlexLayout, {IFlexContainer} from "./FlexLayout";
import * as computeLayout from 'css-layout';
import {IFlexLayoutTemplate} from "./FlexLayout";

interface IStyle {
    top?:number,
    left?:number,
    width?:number,
    height?:number
}
interface IImage{
    url:string,
    width?:number,
    height?:number
}

interface INode {
    generate(layout:any):any;
}
interface IPageOptions {
    imagesPerPage?:number;
    width?:number;
    height?:number;
    background:any;
}

const IMAGES_PER_PAGE:number = 3;
export class ImageGallery implements INode  {

    ImagesPerPage:number;
    ImageBoxes:Array<ImageBox> = [];

    constructor(public name: string, images:Array<IImage>,public LayoutTemplate:IFlexLayoutTemplate, public PageOptions?:IPageOptions) {
        if (this.PageOptions === undefined) this.PageOptions = {};

        this.ImagesPerPage = this.PageOptions.imagesPerPage || IMAGES_PER_PAGE;
        this.ImageBoxes = images.map(function(image,index){
            return new ImageBox(image)
        })
    }
    generate() {

        return {
            name:this.name,
            elementName:"ObjectSchema",
            props:{
                background:this.PageOptions.background
            },
            containers: chunk(this.ImageBoxes,this.ImagesPerPage).map(function(images,index){
                return new ImageContainer(images,this.LayoutTemplate,this.PageOptions)
            },this).map(function(item){return item.generate()})
        }
    }
}
class ImageContainer{
    public FlexContainer:IFlexContainer;

    constructor (private images:Array<ImageBox>,public LayoutTemplate, public PageOptions:any)
    {
        this.FlexContainer = new FlexLayout(LayoutTemplate).getContainer(images.length);
    }

    generate(){
        var input = this.FlexContainer;
        var nodeInput = {
            style: {
                width: (input.flexDirection === 'row' || input.flexDirection === 'row-reverse')?this.PageOptions.width:undefined,
                height: !(input.flexDirection === 'row' || input.flexDirection === 'row-reverse')?this.PageOptions.height:undefined,
                //position:'relative',
                flexDirection: input.flexDirection,
                flexWrap: input.flexWrap,
                justifyContent: input.justifyContent,
                alignItems: input.alignItems,
                alignContent: input.alignContent
            },
            children: map(input.items, function (item,i) {
                var image = this.images[i].Image;
                var newItem:any = {
                    position:'relative',
                    //margin:20
                };
                if (!!image.width) newItem.width = image.width;
                if (!!image.height) newItem.height = image.height;
                return {style: extend(newItem,item)}
            },this)
        };

        computeLayout(nodeInput);
        //console.log(JSON.stringify(nodeInput,null,4));
        return {
            name: "ImageContainer",
            elementName: "Container",
            style: {
                width:730,
                height:1000
            },
            props:{
                unbreakable:true
            },
            boxes:this.images.map(function(item:INode,i:number){return item.generate(extend(nodeInput.children[i].layout,{}))},this)
        }
    }
}
class ImageBox implements INode {
    constructor (public Image:IImage){

    }
    generate(style:any){
        return {
            name: "Image",
            elementName: "Core.ImageBox",
            style: style,
            props: {
                url: this.Image.url,
                border:{
                    width:5,
                    radius:20
                },
                width:this.Image.width,
                height:this.Image.height
            }
        }
    }
}
