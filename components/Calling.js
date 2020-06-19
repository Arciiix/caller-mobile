import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import io from "socket.io-client";
const room = "default";
const socket = io(`http://10.249.20.105:8500?room=${room}&type=readonly`);

class Calling extends React.Component {
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
      justifyContent: "space-between",
      backgroundColor: "#14bdac",
    },
    alert: {
      left: 0,
      right: 0,
      marginTop: 20,
      marginBottom: 0,
      marginLeft: "auto",
      marginRight: "auto",
      textAlign: "center",
      backgroundColor: "#d4edda",
      borderColor: "#c3e6cb",
      paddingTop: 0.75,
      paddingBottom: 0.75,
      paddingLeft: 1.25,
      paddingRight: 1.25,
      marginBottom: 1,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "transparent",
      borderRadius: 0.25,
      width: "90%",
      minHeight: 100,
      display: "flex",
      flexDirection: "column",
    },
    alertHeader: {
      fontSize: 50,
      color: "#155724",
      textAlign: "center",
      fontWeight: "bold",
    },
    alertBody: {
      fontSize: 25,
      color: "#155724",
      textAlign: "center",
    },
    buttons: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    sendBtn: {
      height: 75,
      width: "100%",
      backgroundColor: "#007bff",
      marginBottom: 20,
    },
    sendBtnText: {
      color: "white",
      textAlign: "center",
      fontSize: 40,
      lineHeight: 75,
    },
    endBtn: {
      height: 75,
      width: "100%",
      backgroundColor: "#dc3545",
    },
    endBtnText: {
      color: "white",
      textAlign: "center",
      fontSize: 40,
      lineHeight: 75,
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      message: {
        message: "",
        name: "",
      },
      isLoaded: false,
    };
  }

  async componentDidMount() {
    let getMessagePromise = new Promise((resolve, reject) => {
      socket.emit("lastMessage", room);
      socket.on("lastMessage", (data) => {
        resolve(data);
      });
    });

    let lastMessage = await getMessagePromise;
    if (!lastMessage) {
      lastMessage = { message: "Żadnej nie ma!", name: "Wiadomość" };
    }
    this.setState({ message: lastMessage, isLoaded: true });

    socket.emit("statusUpdate", {
      toSender: true,
      status: "read",
      room: room,
    });
  }
  static navigationOptions = {
    title: "Wołanie",
    headerStyle: { backgroundColor: "#09ab9b" },
  };

  end() {
    socket.emit("statusUpdate", {
      toSender: true,
      status: "end",
      room: room,
    });
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
          <View style={this.styles.alert}>
            <Text style={this.styles.alertHeader}>
              {this.state.message.name}
            </Text>
            <Text style={this.styles.alertBody}>
              {this.state.message.message}
            </Text>
          </View>
          <View style={this.styles.buttons}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Message")}
              style={this.styles.sendBtn}
            >
              <Text style={this.styles.sendBtnText}>Wyślij</Text>
            </TouchableOpacity>
            <TouchableOpacity style={this.styles.endBtn} onPress={this.end}>
              <Text style={this.styles.endBtnText}>Zakończ</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
}

export default Calling;
