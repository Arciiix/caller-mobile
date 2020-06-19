import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";

import io from "socket.io-client";
const room = "default";
let socket;

class Message extends React.Component {
  styles = StyleSheet.create({
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
    form: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    input: {
      fontSize: 30,
      marginLeft: 10,
      lineHeight: 50,
      width: "70%",
      display: "flex",
      height: 60,
      paddingTop: 1,
      paddingBottom: 1,
      paddingLeft: 2,
      paddingRight: 2,
      color: "#495057",
      backgroundColor: "#fff",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "#ced4da",
      borderRadius: 0.25,
    },
    button: {
      height: 60,
      width: "20%",
      backgroundColor: "#28a745",
      marginRight: 10,
    },
    buttonText: {
      lineHeight: 60,
      fontSize: 20,
      color: "white",
      textAlign: "center",
    },
  });
  constructor(props) {
    super(props);
    this.state = {
      message: "Jeszcze nic tu nie ma!",
      inputText: "",
      isActive: true,
    };
  }
  static navigationOptions = {
    title: "Wiadomości",
    headerStyle: { backgroundColor: "#09ab9b" },
  };

  componentDidMount() {
    socket = io(`http://10.249.20.105:8500?room=${room}&type=mobile`);
    socket.on("message", (content) => {
      this.setState({ message: content });
    });
    //When sender ends the call (leaves)
    socket.on("statusUpdate", (newStatus) => {
      if (newStatus === "end") {
        this.setState({ isActive: false });
      }
    });

    socket.emit("statusUpdate", {
      toSender: true,
      status: "writingMessage",
      room: room,
    });
  }

  componentWillUnmount() {
    socket.emit("statusUpdate", {
      toSender: false,
      status: "turnOnNotifications",
      room: room,
    });
    socket.emit("statusUpdate", {
      toSender: true,
      status: "end",
      room: room,
    });
  }

  send() {
    socket.emit("message", {
      toSender: true,
      message: this.state.inputText,
      room: room,
    });
    this.setState({ inputText: "" }, this.forceUpdate);
  }
  render() {
    return (
      <View style={this.styles.container}>
        <View style={this.styles.alert}>
          <Text style={this.styles.alertHeader}>Wiadomość</Text>
          <Text style={this.styles.alertBody}>{this.state.message}</Text>
        </View>
        <View style={this.styles.form}>
          <TextInput
            style={this.styles.input}
            onChangeText={(text) => this.setState({ inputText: text })}
            value={this.state.inputText}
            onKeyDown={(e) => {
              if (e.key.toLowerCase() === "enter") {
                this.send.bind(this)();
              }
            }}
          />
          <TouchableOpacity
            onPress={this.send.bind(this)}
            style={this.styles.button}
          >
            <Text style={this.styles.buttonText}>Wyślij</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default Message;
