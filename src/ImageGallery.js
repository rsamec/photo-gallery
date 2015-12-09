var lodash_1 = require('lodash');
var FlexLayout_1 = require("./FlexLayout");
var computeLayout = require('css-layout');
var IMAGES_PER_PAGE = 3;
var ImageGallery = (function () {
    function ImageGallery(name, images, LayoutTemplate, PageOptions) {
        this.name = name;
        this.LayoutTemplate = LayoutTemplate;
        this.PageOptions = PageOptions;
        this.ImageBoxes = [];
        if (this.PageOptions === undefined)
            this.PageOptions = {};
        this.ImagesPerPage = this.PageOptions.imagesPerPage || IMAGES_PER_PAGE;
        this.ImageBoxes = images.map(function (image, index) {
            return new ImageBox(image);
        });
    }
    ImageGallery.prototype.generate = function () {
        return {
            name: this.name,
            elementName: "ObjectSchema",
            props: {
                background: this.PageOptions.background
            },
            containers: lodash_1.chunk(this.ImageBoxes, this.ImagesPerPage).map(function (images, index) {
                return new ImageContainer(images, this.LayoutTemplate, this.PageOptions);
            }, this).map(function (item) { return item.generate(); })
        };
    };
    return ImageGallery;
})();
exports.ImageGallery = ImageGallery;
var ImageContainer = (function () {
    function ImageContainer(images, LayoutTemplate, PageOptions) {
        this.images = images;
        this.LayoutTemplate = LayoutTemplate;
        this.PageOptions = PageOptions;
        this.FlexContainer = new FlexLayout_1["default"](LayoutTemplate).getContainer(images.length);
    }
    ImageContainer.prototype.generate = function () {
        var input = this.FlexContainer;
        var nodeInput = {
            style: {
                width: (input.flexDirection === 'row' || input.flexDirection === 'row-reverse') ? this.PageOptions.width : undefined,
                height: !(input.flexDirection === 'row' || input.flexDirection === 'row-reverse') ? this.PageOptions.height : undefined,
                //position:'relative',
                flexDirection: input.flexDirection,
                flexWrap: input.flexWrap,
                justifyContent: input.justifyContent,
                alignItems: input.alignItems,
                alignContent: input.alignContent
            },
            children: lodash_1.map(input.items, function (item, i) {
                var image = this.images[i].Image;
                var newItem = {
                    position: 'relative'
                };
                if (!!image.width)
                    newItem.width = image.width;
                if (!!image.height)
                    newItem.height = image.height;
                return { style: lodash_1.extend(newItem, item) };
            }, this)
        };
        computeLayout(nodeInput);
        //console.log(JSON.stringify(nodeInput,null,4));
        return {
            name: "ImageContainer",
            elementName: "Container",
            style: {
                width: 730,
                height: 1000
            },
            props: {
                unbreakable: true
            },
            boxes: this.images.map(function (item, i) { return item.generate(lodash_1.extend(nodeInput.children[i].layout, {})); }, this)
        };
    };
    return ImageContainer;
})();
var ImageBox = (function () {
    function ImageBox(Image) {
        this.Image = Image;
    }
    ImageBox.prototype.generate = function (style) {
        return {
            name: "Image",
            elementName: "Core.ImageBox",
            style: style,
            props: {
                url: this.Image.url,
                border: {
                    width: 5,
                    radius: 20
                },
                width: this.Image.width,
                height: this.Image.height
            }
        };
    };
    return ImageBox;
})();
//# sourceMappingURL=ImageGallery.js.map