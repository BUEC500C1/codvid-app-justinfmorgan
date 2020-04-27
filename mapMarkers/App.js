import React from 'react';
import { StyleSheet, Text, View , TextInput} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import * as Permissions from 'expo-permissions'
import * as Location from 'expo-location'
import Geocoder from 'react-native-geocoding';
import Constants from 'expo-constants';

//'https://maps.googleapis.com/maps/api/geocode/json?latlng=11.2742848,75.8013801&key=AIzaSyDzVaKkWBGoCnwxjoeg_ifZ3dUfowZlQAQ'

Geocoder.init("AIzaSyDzVaKkWBGoCnwxjoeg_ifZ3dUfowZlQAQ");

export default class App extends React.Component {
  state = {
    mapRegion: null,
    hasLocationPermissions: false,
    locationResult: null,
    location: null,
    markerLatitude: null,
    markerLongitude: null,
    geoData: null,
    country: null
  };

  componentDidMount() {
    this.getLocationAsync();
  }


  async grabGeoData(lat, lng) {
    await Geocoder.from(lat, lng)
        .then(json => {
            // console.log(JSON.stringify(json))
            var addressComponents = json.results[0].address_components;
            // console.log(addressComponents);
            for (var i = 0; i < addressComponents.length; i++) {
                if (addressComponents[i].types[0] == "country") {
                    this.setState({ country: addressComponents[i].long_name});
                    console.log(addressComponents[i].long_name);
                }
            }
            this.setState({ geoData: addressComponents});
            // alert(JSON.stringify(addressComponents))
        })
        .catch(error => console.warn(error));
  }

  // extract country short name (e.g. GB for Great Britain) from google geocode API result
  getCountryName() {
    for (var i = 0; i < this.state.geoData.length; i++) {
        if (this.state.geoData[i].types[0] == "country") {
            this.setState({ country: this.state.geoData[i].long_name});
            console.log(this.state.geoData[i].long_name);
        }
    }
  }

  async markerFunction(lat, lon) {
    this.setState({ markerLatitude: lat, markerLongitude: lon});
    this.grabGeoData(lat, lon);
    // this.getCountryName();
  }

  handleMapRegionChange = (mapRegion) => {
    // console.log(mapRegion);
    this.setState({ mapRegion });
  }

  findCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const location = JSON.stringify(position);

        this.setState({ location });
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  async getLocationAsync() {
   let { status } = await Permissions.askAsync(Permissions.LOCATION);
   if (status !== 'granted') {
     this.setState({
       locationResult: 'Permission to access location was denied',
     });
   } else {
     this.setState({ hasLocationPermissions: true });
   }

   let location = await Location.getCurrentPositionAsync({});
   this.setState({ locationResult: location });
   
   // Center the map on the location we just fetched.
  this.setState({mapRegion: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }});
  }

  render() {
    var mapStyle=[{"elementType": "geometry", "stylers": [{"color": "#242f3e"}]},{"elementType": "labels.text.fill","stylers": [{"color": "#746855"}]},{"elementType": "labels.text.stroke","stylers": [{"color": "#242f3e"}]},{"featureType": "administrative.locality","elementType": "labels.text.fill","stylers": [{"color": "#d59563"}]},{"featureType": "poi","elementType": "labels.text.fill","stylers": [{"color": "#d59563"}]},{"featureType": "poi.park","elementType": "geometry","stylers": [{"color": "#263c3f"}]},{"featureType": "poi.park","elementType": "labels.text.fill","stylers": [{"color": "#6b9a76"}]},{"featureType": "road","elementType": "geometry","stylers": [{"color": "#38414e"}]},{"featureType": "road","elementType": "geometry.stroke","stylers": [{"color": "#212a37"}]},{"featureType": "road","elementType": "labels.text.fill","stylers": [{"color": "#9ca5b3"}]},{"featureType": "road.highway","elementType": "geometry","stylers": [{"color": "#746855"}]},{"featureType": "road.highway","elementType": "geometry.stroke","stylers": [{"color": "#1f2835"}]},{"featureType": "road.highway","elementType": "labels.text.fill","stylers": [{"color": "#f3d19c"}]},{"featureType": "transit","elementType": "geometry","stylers": [{"color": "#2f3948"}]},{"featureType": "transit.station","elementType": "labels.text.fill","stylers": [{"color": "#d59563"}]},{"featureType": "water","elementType": "geometry","stylers": [{"color": "#17263c"}]},{"featureType": "water","elementType": "labels.text.fill","stylers": [{"color": "#515c6d"}]},{"featureType": "water","elementType": "labels.text.stroke","stylers": [{"color": "#17263c"}]}];
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>
          Pan, zoom, and tap on the map!
        </Text>
        
        {
          this.state.locationResult === null ?
          <Text>Finding your current location...</Text> :
          this.state.hasLocationPermissions === false ?
            <Text>Location permissions are not granted.</Text> :
            this.state.mapRegion === null ?
            <Text>Map region doesn't exist.</Text> :
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: this.state.locationResult.coords.latitude,
                longitude: this.state.locationResult.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
              }}
              onRegionChange={this.handleMapRegionChange}
              customMapStyle={mapStyle}
            >
              <Marker
              draggable
              coordinate = {{
                latitude: this.state.locationResult.coords.latitude,
                longitude: this.state.locationResult.coords.longitude,
              }}
              onDragEnd={(e) => 
              //alert(this.getCountryName(this.grabGeoData(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)))
              //   this.setState({
              //   country: this.grabCountry(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)
              // })
                // this.setState({ markerLatitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude})
                this.markerFunction(e.nativeEvent.coordinate.latitude,e.nativeEvent.coordinate.longitude)
              }
                //alert(JSON.stringify(e.nativeEvent.coordinate))}
              title={'Test Marker'}
              description={'This is a description of the marker'}
              />
            </MapView>
        }
      </View>
        
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    paddingTop: Constants.statusBarHeight,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
  map: {
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
  },
});
