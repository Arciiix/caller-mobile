import React from "react";

import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

//Views
import Home from "./components/Home";
import Calling from "./components/Calling";
import Message from "./components/Message";

const icon = require("./assets/icon.png");

const AppNavigator = createStackNavigator(
  {
    Home: Home,
    Calling: Calling,
    Message: Message,
  },
  {
    initialRouteName: "Home",
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
