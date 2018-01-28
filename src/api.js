const FSConfig = require('./config');

/**
 * Returns a list of recommended venues near the current location.
 * https://developer.foursquare.com/docs/api/venues/explore
 *
 * @param {any} currentPos {lat: x, lng: x}
 * @param {String} section One of food, drinks, coffee, shops, arts, outdoors, sights, trending, nextVenues, or topPicks
 * @returns Promise.response
 */
function getVenueRecommendations(currentPos, section) {
    const query = {
        client_id: FSConfig.CLIENT_ID,
        client_secret: FSConfig.CLIENT_SECRET,
        ll: currentPos['lat'] + ',' + currentPos['lng'],
        section: section,
        v: getToday()
    };
    const init = { method: 'GET' };
    const url = FSConfig.BASE_URL + 'venues/explore' + serialize(query);

    return fetch(url, init)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`failed to fetch ${url}`);
            }
        })
        .then(data => {
            return data.response;
        })
        .catch(err => {
            console.log(err);
        });
}

/**
 * @returns format date string: yyyymmdd
 */
function getToday() {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; // Jan is 0
    let yy = today.getFullYear();

    dd = dd < 10 ? '0' + dd : dd;
    mm = mm < 10 ? '0' + mm : mm;

    return '' + yy + mm + dd;
}

function serialize(obj) {
    return '?' + Object.keys(obj).reduce((res, key) => {
        const val = obj[key];
        res.push((val !== null && typeof val === 'object') ?
            serialize(val) :
            encodeURIComponent(key) + '=' + encodeURIComponent(val));
        return res;
    }, []).join('&');
};
