import React, { Component } from 'react'
import { View, BackHandler } from 'react-native'
import Header from './header'
import Menu from './menu'
import Home from './home'
import Calendar from './calendar'
import CycleDay from './cycle-day/cycle-day-overview'
import symptomViews from './cycle-day/symptoms'
import Chart from './chart/chart'
import Settings from './settings'
import Stats from './stats'
import {headerTitles, menuTitles} from './labels'
import setupNotifications from '../lib/notifications'

// design wants everyhting lowercased, but we don't
// have CSS pseudo properties
const headerTitlesLowerCase = Object.keys(headerTitles).reduce((acc, curr) => {
  acc[curr] = headerTitles[curr].toLowerCase()
  return acc
}, {})
const menuTitlesLowerCase = Object.keys(menuTitles).reduce((acc, curr) => {
  acc[curr] = menuTitles[curr].toLowerCase()
  return acc
}, {})

const isSymptomView = name => Object.keys(symptomViews).indexOf(name) > -1

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentPage: 'Home'
    }
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress)
    setupNotifications(this.navigate)
  }

  componentWillUnmount() {
    this.backHandler.remove()
  }

  navigate = (pageName, props) => {
    this.origin = this.state.currentPage
    this.setState({currentPage: pageName, currentProps: props})
  }

  handleBackButtonPress = () => {
    if (this.state.currentPage === 'Home') return false
    if (isSymptomView(this.state.currentPage)) {
      this.navigate(
        this.origin, { cycleDay: this.state.currentProps.cycleDay }
      )
    } else if(this.state.currentPage === 'CycleDay') {
      this.navigate(this.origin)
    } else {
      this.navigate('Home')
    }
    return true
  }

  render() {
    const page = {
      Home, Calendar, CycleDay, Chart, Settings, Stats, ...symptomViews
    }[this.state.currentPage]
    return (
      <View style={{flex: 1}}>
        {this.state.currentPage != 'CycleDay' && !isSymptomView(this.state.currentPage) &&
          <Header
            title={headerTitlesLowerCase[this.state.currentPage]}
          />}
        {isSymptomView(this.state.currentPage) &&
          <Header
            title={headerTitlesLowerCase[this.state.currentPage]}
            isSymptomView={true}
            goBack={this.handleBackButtonPress}
          />}


        {React.createElement(page, {
          navigate: this.navigate,
          ...this.state.currentProps
        })}

        {!isSymptomView(this.state.currentPage) &&
          <Menu
            navigate={this.navigate}
            titles={menuTitlesLowerCase}
          />
        }
      </View>
    )
  }
}
