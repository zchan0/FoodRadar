export class Restaurant {
    constructor(obj) {
        this.id = obj.id;
        this.name = obj.name;
        this.price = obj.price ? obj.price.tier : '';
        this.rating = obj.rating;
        this.ratingColor = obj.ratingColor;
        this.category = obj.categories[0].name;
        this.location = {
            lat: obj.location.lat,
            lng: obj.location.lng
        };
    }
}

export class Photo {
    constructor(obj) {
        this.createdAt = obj.createdAt;
        this.width  = obj.width;
        this.height = obj.height;
        // assemble a photo URL: prefix + SIZE(width x height) + suffix
        this.photoUrl = obj.prefix +
                        obj.width + 'x' + obj.height +
                        obj.suffix;
    }
}
