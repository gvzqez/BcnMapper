var map;
var clientID, clientSecret;

function ViewModel() {
    var self = this;

    this.filterAction = ko.observable("");
    this.markers = [];

    // This function populates the infoWindow when the marker is clicked
    // Only one infoWindow opened is allowed
    this.populateInfoWindow = function(marker, infoWindow) {
        // Check to make sure the infoWindow is not already opened on this marker.
        if (infoWindow.marker != marker) {
            infoWindow.marker = marker;

            // Foursquare API Client
            clientID = "FH2SIJHOQZ1DWLNTVWK4WPHX0TUZUHXFVNC1OWEM3NQRKX1L";
            clientSecret = "5ABJNZZRB4LP5WDLXV3TBKXQ400IUBNFEKPP1SAE1QVZXPEP";

            // Foursquare API Endpoint
            var apiUrl = 'https://api.foursquare.com/v2/venues/search?' +
                         'll=' + marker.lat + ',' + marker.lng +
                         '&client_id=' + clientID +
                         '&client_secret=' + clientSecret +
                         '&query=' + marker.title +
                         '&v=20170708' + '&m=foursquare';

            $.getJSON(apiUrl).done(function(marker) {
                var response = marker.response.venues[0];
                self.street = response.location.formattedAddress[0];
                self.city = response.location.formattedAddress[1];
                self.country = response.location.formattedAddress[4];

                self.markerContent =
                    '<div>' +
                        '<h6 class="iw_address_title"> Address: </h6>' +
                        '<p class="iw_address">' + self.street + '</p>' +
                        '<p class="iw_address">' + self.city + '</p>' +
                    '</div>';

                infoWindow.setContent(self.markerTitle + self.markerContent);

            }).fail(function() {
                alert(
                    "There was an issue loading the Foursquare API. Please refresh your page to try again."
                );
            });

            this.markerTitle = '<div>' +
                                   '<h3 cla ss="iw_title">' + marker.title +'</h3>' +
                                   '<h4 class="iw_subtitle">' + marker.category +'</h4>' +
                               '</div>';

            infoWindow.open(map, marker);
            infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
            });
        }
    };

    this.populateAndBounceMarker = function() {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);

        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1000);
    };

    this.initMap = function() {
        map = new google.maps.Map(document.getElementById('map'), {
                center: new google.maps.LatLng(41.3947838, 2.1772746),
                zoom: 14,
            });

        this.largeInfoWindow = new google.maps.InfoWindow();

        for (var i = 0; i < markers.length; i++) {
            this.title = markers[i].title;
            this.lat = markers[i].lat;
            this.lng = markers[i].lng;
            this.category = markers[i].type;

            this.marker = new google.maps.Marker({
                id: i,
                map: map,
                title: this.title,
                category: this.category,
                lat: this.lat,
                lng: this.lng,
                position: {
                    lat: this.lat,
                    lng: this.lng
                },
                animation: google.maps.Animation.DROP
            });

            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.populateAndBounceMarker);
        }
    };

    this.initMap();

    // This block appends our locations to a list using data-bind
    // It also makes the filter work
    this.filter = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.filterAction().toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}


googleResponseError = function googleResponseError() {
    alert(
        'Oops. Google Maps did not load. Please refresh the page and try again!'
    );
};


function initApp() {
    ko.applyBindings(new ViewModel());
}
