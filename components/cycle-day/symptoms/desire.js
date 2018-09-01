import React, { Component } from 'react'
import {
  View,
  ScrollView
} from 'react-native'
import styles from '../../../styles'
import { saveSymptom } from '../../../db'
import { intensity as labels } from '../labels/labels'
import ActionButtonFooter from './action-button-footer'
import RadioButtonGroup from '../radio-button-group'

export default class Desire extends Component {
  constructor(props) {
    super(props)
    this.cycleDay = props.cycleDay
    this.makeActionButtons = props.makeActionButtons
    let desireValue = this.cycleDay.desire && this.cycleDay.desire.value
    if (!(typeof desireValue === 'number')) {
      desireValue = -1
    }
    this.state = { currentValue: desireValue }
  }

  render() {
    const desireRadioProps = [
      { label: labels[0], value: 0 },
      { label: labels[1], value: 1 },
      { label: labels[2], value: 2 }
    ]
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.page}>
          <View>
            <RadioButtonGroup
              buttons={desireRadioProps}
              acitve={this.state.currentValue}
              onSelect={val => this.setState({ currentValue: val })}
            />
          </View>
        </ScrollView>
        <ActionButtonFooter
          symptom='desire'
          cycleDay={this.cycleDay}
          saveAction={() => {
            saveSymptom('desire', this.cycleDay, { value: this.state.currentValue })
          }}
          saveDisabled={this.state.currentValue === -1}
          navigate={this.props.navigate}
        />
      </View>
    )
  }
}
