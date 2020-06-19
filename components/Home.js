import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";

import { Notifications } from "expo";
import * as Permissions from "expo-permissions";

import io from "socket.io-client";
const room = "default";
const socket = io(`http://10.249.20.105:8500?room=${room}&type=readonly`);

class Home extends React.Component {
  styles = StyleSheet.create({
    loadingView: {
      flex: 1,
      alignContent: "center",
      justifyContent: "center",
      backgroundColor: "#14bdac",
    },
    container: {
      flex: 1,
      alignContent: "center",
      justifyContent: "center",
      backgroundColor: "#14bdac",
    },
    activeStatusMessage: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 40,
    },
    activeDot: {
      borderRadius: 18 / 2,
      textAlign: "center",
      width: 18,
      height: 18,
    },

    active: {
      backgroundColor: "#62db52",
    },
    inactive: {
      backgroundColor: "#eb2c1e",
    },

    activeDifferentDevice: {
      backgroundColor: "#e8b127",
    },
    textActiveDifferentDevice: {
      color: "#e8b127",
    },
    textActive: {
      color: "#62db52",
    },
    textInactive: {
      color: "#eb2c1e",
    },
    activeStatus: {
      margin: 2,
    },
    activeText: {
      lineHeight: 70,
      fontSize: 60,
      marginLeft: 2,
    },
    buttonsDiv: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    switchBtn: {
      height: 70,
      width: "100%",
      backgroundColor: "#28a745",
      marginBottom: 20,
    },
    callingBtn: {
      height: 40,
      width: "100%",
      backgroundColor: "#2453f0",
    },
    switchBtnText: {
      fontSize: 40,
      color: "white",
      textAlign: "center",
      lineHeight: 70,
    },
    callingBtnText: {
      fontSize: 20,
      color: "white",
      textAlign: "center",
      lineHeight: 40,
    },
  });
  static navigationOptions = {
    headerShown: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      isActive: { isActive: false, onThisDevice: false },
    };
  }
  async componentDidMount() {
    await this.getStatus();
    let isThereAMessage = await this.checkMessage();
    if (isThereAMessage) {
      this.props.navigation.navigate("Calling");
    }
    this.setState({ isLoaded: true }, this.forceUpdate);
  }

  async getStatus() {
    let activeStatusPromise = new Promise((resolve, reject) => {
      socket.emit(`isActive`, room);
      socket.on(`isActive`, (isActive) => {
        resolve(isActive);
      });
    });
    let { isActive, type } = await activeStatusPromise;
    if (isActive) {
      if (type === "mobilePush") {
        this.setState({ isActive: { isActive: true, onThisDevice: true } });
      } else {
        this.setState({ isActive: { isActive: true, onThisDevice: false } });
      }
    } else {
      this.setState({ isActive: { isActive: false, onThisDevice: false } });
    }
    this.forceUpdate();
  }

  async checkMessage() {
    return new Promise((resolve, reject) => {
      socket.emit("lastMessage", room);
      socket.on("lastMessage", (data) => {
        if (!data) return resolve(false);
        if (data.date + 60000 > new Date().getTime()) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  activeState(isText) {
    if (this.state.isActive.isActive) {
      if (this.state.isActive.onThisDevice) {
        return isText ? this.styles.textActive : this.styles.active;
      } else {
        return isText
          ? this.styles.textActiveDifferentDevice
          : this.styles.activeDifferentDevice;
      }
    } else {
      return isText ? this.styles.textInactive : this.styles.inactive;
    }
  }
  async setToken() {
    let activeStatusPromise = new Promise((resolve, reject) => {
      socket.emit(`isActive`, room);
      socket.on(`isActive`, (isActive) => {
        resolve(isActive);
      });
    });

    let { isActive, type } = await activeStatusPromise;
    if (type === "mobilePush") {
      socket.emit(`changeToPrevType`, room);
      await this.getStatus();
    } else {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

      if (status !== "granted") {
        Alert.alert(
          "Uprawnienia",
          "Nie przydzielono uprawnień do wysyłania powiadomień!"
        );
        return;
      }
      let token = await Notifications.getExpoPushTokenAsync();
      let request = await fetch(
        `http://10.249.20.105:8500/setNotification?room=${room}&token=${token}`
      );
      let responseStatus = await request.status;
      if (responseStatus === 200) {
        await this.getStatus();
      }
    }
  }
  render() {
    if (!this.state.isLoaded) {
      //Loading screen
      return (
        <View style={this.styles.loadingView}>
          <ActivityIndicator size={100} color="#ffffff" />
        </View>
      );
    } else {
      return (
        <View style={this.styles.container}>
          <View style={this.styles.activeStatusMessage}>
            <View
              style={[this.styles.activeDot, this.activeState(false)]}
            ></View>
            <Text style={[this.styles.activeText, this.activeState(true)]}>
              {this.state.isActive.isActive ? "Aktywny" : "Nieaktywny"}
            </Text>
          </View>
          <View style={this.styles.buttonsDiv}>
            <TouchableOpacity
              style={this.styles.switchBtn}
              onPress={this.setToken.bind(this)}
            >
              <Text style={this.styles.switchBtnText}>Przełącz</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={this.styles.callingBtn}
              onPress={() => this.props.navigation.navigate("Calling")}
            >
              <Text style={this.styles.callingBtnText}>Ekran wołania</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
}

export default Home;
