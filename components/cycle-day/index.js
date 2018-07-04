import React, { Component } from 'react'
import {
  View,
  Text
} from 'react-native'
import cycleDayModule from '../../lib/get-cycle-day-number'
import DayView from './cycle-day-overview'
import BleedingEditView from './symptoms/bleeding'
import TemperatureEditView from './symptoms/temperature'
import MucusEditView from './symptoms/mucus'
import { formatDateForViewHeader } from './labels/format'
import styles from '../../styles'
import actionButtonModule from './action-buttons'

const getCycleDayNumber = cycleDayModule()

export default class Day extends Component {
  constructor(props) {
    super(props)
    this.cycleDay = props.navigation.state.params.cycleDay

    this.state = {
      visibleComponent: 'dayView',
    }

    this.showView = view => {
      this.setState({visibleComponent: view})
    }

    this.makeActionButtons = actionButtonModule(this.showView)
  }

  render() {
    const cycleDayNumber = getCycleDayNumber(this.cycleDay.date)
    return (
      <View>
        <View style={ styles.cycleDayDateView }>
          <Text style={styles.dateHeader}>
            {formatDateForViewHeader(this.cycleDay.date)}
          </Text>
        </View >
        <View style={ styles.cycleDayNumberView }>
          { cycleDayNumber && <Text style={styles.cycleDayNumber} >Cycle day {cycleDayNumber}</Text> }
        </View >
        <View>
          {
            { dayView: <DayView cycleDay={this.cycleDay} showView={this.showView} />,
              bleedingEditView: <BleedingEditView cycleDay={this.cycleDay} showView={this.showView}/>,
              temperatureEditView: <TemperatureEditView cycleDay={this.cycleDay} showView={this.showView}/>,
              mucusEditView: <MucusEditView cycleDay={this.cycleDay} showView={this.showView}/>
            }[this.state.visibleComponent]
          }
        </View >
      </View >
    )
  }
}
