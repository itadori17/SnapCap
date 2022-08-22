import { StyleSheet, Text, View, SafeAreaView, Button, Image, Alert, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import Ionicons from 'react-native-vector-icons/Ionicons';


let apiKey = 'AIzaSyD3fTr-9rdgnRjeCfXXVl6kkHJpOZftY-c';

import * as Location from 'expo-location';

export default function TakePic () {
    let cameraRef = useRef();
    const [hasCameraPermission, setHasCameraPermission] = useState();
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
    const [photo, setPhoto] = useState();

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [address, setAddress] = useState(null);
    
  
    useEffect(() => {
      (async () => {
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
        setHasCameraPermission(cameraPermission.status === "granted");
        setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
      })();
    }, []);
  
    if (hasCameraPermission === undefined) {
      return <Text>Requesting permissions...</Text>
    } else if (!hasCameraPermission) {
      return <Text>Permission for camera not granted. Please change this in settings.</Text>
    }
  
    let takePic = async () => {
      let options = {
        quality: 1,
        base64: true,
        exif: false
      };
  
      let newPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(newPhoto);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }

      Location.setGoogleApiKey(apiKey);

      console.log(status);

      let { coords } = await Location.getCurrentPositionAsync();

      setLocation(coords);

      console.log(coords);

      if (coords) {
        let { longitude, latitude } = coords;

        let regionName = await Location.reverseGeocodeAsync({
          longitude,
          latitude,
        });
        setAddress(regionName[0]);
        console.log(regionName, 'nothing');
      }
    };
  
    if (photo) {
      let sharePic = () => {
        shareAsync(photo.uri).then(() => {
          setPhoto(undefined);
        });
        
      };
  
      let savePhoto = () => {
        MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
          setPhoto(undefined);
        });
        Alert.alert("Photo saved successfully");
      };
  
      return (
        <SafeAreaView style={styles.container}>
          <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
          <View style={styles.location} >
          <Text style={styles.big} >
        {!location
          ? 'Waiting'
          : `Taken from: ${JSON.stringify(address?.['city'])} ${JSON.stringify(address?.['district'])} \n${JSON.stringify(address?.['name'])}` 
            }
      </Text>
          </View>
          
          <View style={styles.buttonStyle}>
          <TouchableOpacity title="Share" onPress={sharePic} style={styles.buttonShare}  >
          <Ionicons name="md-share" size={30} color="#FF4500" />
          <Text style={styles.text1} > Share </Text>
          </TouchableOpacity>
        
          {hasMediaLibraryPermission ? <TouchableOpacity onPress={savePhoto} style={styles.buttonSave}  >
            <Ionicons name="md-checkmark-circle-outline" size={30} color="#B2D2A4" />
            <Text style={styles.text2} > Save </Text>
            
            </TouchableOpacity> : undefined}
          <TouchableOpacity  onPress={() => setPhoto(undefined)} style={styles.buttonCancel}   >
          <Ionicons name="md-exit" size={30} color="#F51663" />
          <Text style={styles.text3} > Cancel </Text>
          </TouchableOpacity>
          </View>
        </SafeAreaView>
        
      );
    }
  
    return (
      <Camera style={styles.container} ref={cameraRef}>
        <View style={styles.buttonContainer}>
        
          <TouchableOpacity  onPress={takePic}  style={styles.buttonPic} >
          <Ionicons name="camera" size={50} color="#D3D3CB" />
          </TouchableOpacity>
          
        </View>
        <StatusBar style="auto" />
      </Camera>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContainer: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
    },
    buttonPic: {
        alignItems: "center",
        
        padding: 10,
        width: 100,
    },
    preview: {
      alignSelf: 'stretch',
      flex: 1
    },
    button: {
        alignItems: "center",
        backgroundColor: "#FF4500",
        padding: 10
      },
    buttonStyle: {
      flexDirection: "row",
          height: 75,
          padding: 10,
          justifyContent: "space-around",
          color: "#E5CEF6"
    },
    buttonSave: {
        alignItems: "center",
        
        padding: 10,
        width: 100,
      },
      buttonCancel: {
        alignItems: "center",
       
        padding: 10,
        width: 100,
      },
      buttonShare: {
        alignItems: "center",
        
        padding: 10,
        width: 100,
      },
      text1 :{
        fontSize: 15,
        color: "#FF4500",
      },
      text2 :{
        fontSize: 15,
        color: "#B2D2A4",
      },
      text3 :{
        fontSize: 15,
        color: "#F51663",
      },
      big: {
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold',
        
      },
      location : {
        
        justifyContent: 'space-around',
        backgroundColor: '#ECFDF1',
        
      }

  });
