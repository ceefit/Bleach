import React, { Component } from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'

export default class DeviceList extends Component {

    renderItem = (device, i) => {
        deviceID = device.id;
        deviceName = device.name;
        text = ((deviceName == null ? "Unknown Device" : deviceName) + ": " + deviceID);

        const { onPressItem } = this.props

        return (
            <TouchableOpacity key={i} style={styles.item} onPress={() => onPressItem(i)}>
                <Text>{text}</Text>
            </TouchableOpacity>
        )
    }

    render() {
        const { list } = this.props   // the list of items

        return <View>{list.map(this.renderItem)}</View>  // render each item and put it in a View
    }
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: 'whitesmoke',
        marginBottom: 5,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center'
    }
})