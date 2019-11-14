import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ScrollView } from 'react-native';
import { BleManager } from 'react-native-ble-plx'
import DeviceList from './DeviceList';

export default class App extends Component {

  constructor(){
    super();
    this.manager = new BleManager();
    this.state = {devices: [], hrValue: "", firmware: ""};
    this.deviceIDs = [];

    this.DEVICE_INFORMATION_SERVICE = "0000180a-0000-1000-8000-00805f9b34fb";
    this.FIRMWARE_REVISION_STRING = "00002a26-0000-1000-8000-00805f9b34fb";
    this.HEART_RATE_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb";
    this.HEART_RATE_MEASUREMENT = "00002a37-0000-1000-8000-00805f9b34fb";

  }

  getFirmwareServiceUUID(){
    return this.DEVICE_INFORMATION_SERVICE;
  }

  getFirmwareCharacteristicUUID(){
    return this.FIRMWARE_REVISION_STRING;
  }

  getHrServiceUUID(){
    return this.HEART_RATE_SERVICE;
  }

  getHrCharacteristicUUID(){
    return this.HEART_RATE_MEASUREMENT;
  }

  getHrFromCharacteristic(characteristic){
    encodedValue = characteristic.value
    decodedValue = atob(encodedValue)
    hrValue = decodedValue.charCodeAt(1)
    return hrValue
  }

  componentWillMount() {
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

        if (device.id != null && !this.deviceIDs.includes(device.id)){
          devices = Array.from(this.state.devices)  // make a copy
          devices.push(device)
          this.deviceIDs.push(device.id)
          this.setState({devices: devices})
        }
    });
  }

  setupNotifications(device){
    const firmwareService = this.getFirmwareServiceUUID();
    const firmwareCharacteristic = this.getFirmwareCharacteristicUUID();
    const hrService = this.getHrServiceUUID();
    const getHrCharacteristicUUID = this.getHrCharacteristicUUID();

    device.readCharacteristicForService(firmwareService, firmwareCharacteristic).then((characteristic) => {
      this.setState({firmware: atob(characteristic.value)})
      console.log(characteristic)
    })

    device.monitorCharacteristicForService(hrService, getHrCharacteristicUUID, (error, characteristic) => {
      if (error){
        console.log(error)
        return
      }
      this.setState({hrValue: this.getHrFromCharacteristic(characteristic)})
    })
  }

  render() {

    return (
      <View style={styles.container}>
        <View style={styles.deviceListContainer}>
          <Text style={styles.header}>Devices:</Text>
          <ScrollView>
            <DeviceList
              list={this.state.devices}
              onPressItem={(i) => {
                console.log("Selected: " + this.state.devices[i].id)
                this.manager.stopDeviceScan();   // stop scanning for more devices since we've seletected one
                device = this.state.devices[i]
                device.connect()
                  .then((device) => {
                      return device.discoverAllServicesAndCharacteristics()
                  })
                  .then((device) => {
                    console.log("Device connected: " + device.name + " - " + device.id);
                    // Do work on device with services and characteristics
                    return this.setupNotifications(device)
                  })
                  .then((device) => {
                    console.log("Listening...");
                  })
                  .catch((error) => {
                      // Handle errors
                      console.log(error);
                  });
              }}
            />
          </ScrollView>
        </View>
        <View style={styles.valuesContainer}>
              <Text>HR: {this.state.hrValue}</Text>
              <Text>Firmware: {this.state.firmware}</Text>
        </View>
      </View>
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
  deviceListContainer: {
    flex: 1
  },
  valuesContainer: {
    flex: 1
  }
});
