import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ScrollView } from 'react-native';
import { BleManager } from 'react-native-ble-plx'

export default class App extends Component {

  constructor(){
    super();
    this.manager = new BleManager();
    this.state = {devices: []};
    this.deviceIDs = [];
  }

  componentWillMount() {
    console.log("here2");
    const subscription = this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
            this.scanAndConnect();
            subscription.remove();
        }
    }, true);
  }

  scanAndConnect() {
    this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
            // Handle error (scanning will be stopped automatically)
            console.log(error);
            return
        }

        // Check if it is a device you are looking for based on advertisement data
        // or other criteria.
        // if (device.name === 'TI BLE Sensor Tag' || 
        //     device.name === 'SensorTag') {
            
        //     // Stop scanning as it's not necessary if you are scanning for one device.
        //     this.manager.stopDeviceScan();

        //     // Proceed with connection.
        // }

        console.log(device.id);
        if (device.id != null && !this.deviceIDs.includes(device.id)){
          newDevice = [device.id, device.name]
          devices = Array.from(this.state.devices)  // make a copy
          devices.push(newDevice)
          this.deviceIDs.push(device.id)
          this.setState({devices: devices})
        }
    });
  }

  render() {
    text = ""
    for (i=0; i<this.state.devices.length; i++){
      device = this.state.devices[i]
      deviceID = device[0]
      deviceName = device[1]
      text += ((deviceName == null ? "Unknown Device" : deviceName) + ": " + deviceID + "\n")
    }

    return (
      <ScrollView>
        <Text style={styles.header}>Devices:</Text>
        <Text style={styles.devices}>{text}</Text>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  devices: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
