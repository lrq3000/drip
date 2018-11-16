import React, { Component } from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import { LocalDate } from 'js-joda'
import Svg, { G } from 'react-native-svg'
import Header from '../header'
import { getCycleDay } from '../../db'
import cycleModule from '../../lib/cycle'
import styles from '../../styles'
import * as labels from './labels'
import AppText from '../app-text'
import BleedingIcon from '../../assets/bleeding'
import CervixIcon from '../../assets/cervix'
import DesireIcon from '../../assets/desire'
import MucusIcon from '../../assets/mucus'
import NoteIcon from '../../assets/note'
import PainIcon from '../../assets/pain'
import SexIcon from '../../assets/sex'
import TemperatureIcon from '../../assets/temperature'

const bleedingLabels = labels.bleeding
const feelingLabels = labels.mucus.feeling.categories
const textureLabels = labels.mucus.texture.categories
const openingLabels = labels.cervix.opening.categories
const firmnessLabels = labels.cervix.firmness.categories
const positionLabels = labels.cervix.position.categories
const intensityLabels = labels.intensity
const sexLabels = labels.sex.categories
const contraceptiveLabels = labels.contraceptives.categories
const painLabels = labels.pain.categories

export default class CycleDayOverView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      date: this.props.date,
      cycleDay: getCycleDay(this.props.date)
    }
  }

  goToCycleDay = (target) => {
    const localDate = LocalDate.parse(this.state.date)
    const targetDate = target === 'before' ?
      localDate.minusDays(1).toString() :
      localDate.plusDays(1).toString()
    this.setState({
      date: targetDate,
      cycleDay: getCycleDay(targetDate)
    })
  }

  navigate(symptom) {
    this.props.navigate(symptom, this.state)
  }

  getLabel(symptomName) {
    const cycleDay = this.state.cycleDay
    if (!cycleDay || !cycleDay[symptomName]) return

    const l = {
      bleeding: bleeding => {
        if (isNumber(bleeding.value)) {
          let bleedingLabel = `${bleedingLabels[bleeding.value]}`
          if (bleeding.exclude) bleedingLabel = "( " + bleedingLabel + " )"
          return bleedingLabel
        }
      },
      temperature: temperature => {
        if (isNumber(temperature.value)) {
          let temperatureLabel = `${temperature.value} °C - ${temperature.time}`
          if (temperature.exclude) {
            temperatureLabel = "( " + temperatureLabel + " )"
          }
          return temperatureLabel
        }
      },
      mucus: mucus => {
        const categories = ['feeling', 'texture', 'value']
        if (categories.every(c => isNumber(mucus[c]))) {
          let mucusLabel = [feelingLabels[mucus.feeling], textureLabels[mucus.texture]].join(', ')
          mucusLabel += `\n${labels.mucusNFP[mucus.value]}`
          if (mucus.exclude) mucusLabel = `(${mucusLabel})`
          return mucusLabel
        }
      },
      cervix: cervix => {
        let cervixLabel = []
        if (isNumber(cervix.opening) && isNumber(cervix.firmness)) {
          cervixLabel.push(
            openingLabels[cervix.opening],
            firmnessLabels[cervix.firmness]
          )
          if (isNumber(cervix.position)) {
            cervixLabel.push(positionLabels[cervix.position])
          }
          cervixLabel = cervixLabel.join(', ')
          if (cervix.exclude) cervixLabel = `(${cervixLabel})`
          return cervixLabel
        }
      },
      note: note => {
        return note.value
      },
      desire: desire => {
        if (isNumber(desire.value)) {
          const desireLabel = `${intensityLabels[desire.value]}`
          return desireLabel
        }
      },
      sex: sex => {
        let sexLabel = []
        if (sex && Object.values(sex).some(val => val)){
          Object.keys(sex).forEach(key => {
            if(sex[key] && key !== 'other' && key !== 'note') {
              sexLabel.push(
                sexLabels[key] ||
                contraceptiveLabels[key]
              )
            }
            if(key === 'other' && sex.other) {
              let label = contraceptiveLabels[key]
              if(sex.note) {
                label = `${label} (${sex.note})`
              }
              sexLabel.push(label)
            }
          })
          sexLabel = sexLabel.join(', ')
          return sexLabel
        }
      },
      pain: pain => {
        let painLabel = []
        if (pain && Object.values(pain).some(val => val)){
          Object.keys(pain).forEach(key => {
            if(pain[key] && key !== 'other' && key !== 'note') {
              painLabel.push(painLabels[key])
            }
            if(key === 'other' && pain.other) {
              let label = painLabels[key]
              if(pain.note) {
                label = `${label} (${pain.note})`
              }
              painLabel.push(label)
            }
          })
          painLabel = painLabel.join(', ')
          return painLabel
        }
      }
    }

    const symptomValue = cycleDay[symptomName]
    const label = l[symptomName](symptomValue)
    if (!label) return
    if (label.length < 45) return label
    return label.slice(0, 42) + '...'
  }

  render() {
    const getCycleDayNumber = cycleModule().getCycleDayNumber
    const cycleDayNumber = getCycleDayNumber(this.state.date)
    const dateInFuture = LocalDate
      .now()
      .isBefore(LocalDate.parse(this.state.date))

    return (
      <View style={{ flex: 1 }}>
        <Header
          isCycleDayOverView={true}
          cycleDayNumber={cycleDayNumber}
          date={this.state.date}
          goToCycleDay={this.goToCycleDay}
        />
        <ScrollView>
          <View style={styles.symptomBoxesView}>
            <SymptomBox
              title='Bleeding'
              onPress={() => this.navigate('BleedingEditView')}
              data={this.getLabel('bleeding')}
              disabled={dateInFuture}
            >
              <BleedingIcon viewBox='10 10 320 400' />
            </SymptomBox>
            <SymptomBox
              title='Temperature'
              onPress={() => this.navigate('TemperatureEditView')}
              data={this.getLabel('temperature')}
              disabled={dateInFuture}
            >
              <TemperatureIcon viewBox='10 10 320 400' />
            </SymptomBox>
            <SymptomBox
              title='Mucus'
              onPress={() => this.navigate('MucusEditView')}
              data={this.getLabel('mucus')}
              disabled={dateInFuture}
            >
              <MucusIcon viewBox='10 10 320 400' />
            </SymptomBox>
            <SymptomBox
              title='Cervix'
              onPress={() => this.navigate('CervixEditView')}
              data={this.getLabel('cervix')}
              disabled={dateInFuture}
            >
              <CervixIcon viewBox='10 10 320 440' />
            </SymptomBox>
            <SymptomBox
              title='Desire'
              onPress={() => this.navigate('DesireEditView')}
              data={this.getLabel('desire')}
              disabled={dateInFuture}
            >
              <DesireIcon viewBox='10 10 320 380' />
            </SymptomBox>
            <SymptomBox
              title='Sex'
              onPress={() => this.navigate('SexEditView')}
              data={this.getLabel('sex')}
              disabled={dateInFuture}
            >
              <SexIcon viewBox='10 10 320 400' />
            </SymptomBox>
            <SymptomBox
              title='Pain'
              onPress={() => this.navigate('PainEditView')}
              data={this.getLabel('pain')}
              disabled={dateInFuture}
            >
              <PainIcon viewBox='10 10 300 400' />
            </SymptomBox>
            <SymptomBox
              title='Note'
              onPress={() => this.navigate('NoteEditView')}
              data={this.getLabel('note')}
            >
              <NoteIcon viewBox='10 10 270 400' />
            </SymptomBox>
            {/*  this is just to make the last row adhere to the grid
        (and) because there are no pseudo properties in RN */}
            <FillerBoxes />
          </View >
        </ScrollView >
      </View >
    )
  }
}




class SymptomBox extends Component {
  render() {
    const d = this.props.data
    const boxActive = d ? styles.symptomBoxActive : {}
    const textActive = d ? styles.symptomTextActive : {}
    const disabledStyle = this.props.disabled ? styles.symptomInFuture : {}

    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        disabled={this.props.disabled}
      >
        <View style={[styles.symptomBox, boxActive, disabledStyle]}>

          {this.props.children ?
            React.Children.map(this.props.children, child => {
              return (
                <Svg width={100} height={50} viewBox={child.props.viewBox}>
                  <G fill={d ? 'white' : 'black'}>
                    {child}
                  </G>
                </Svg>
              )
            })
            : null
          }

          <AppText style={[textActive, disabledStyle]}>
            {this.props.title}
          </AppText>
        </View>
        <View style={[styles.symptomDataBox, disabledStyle]}>
          <AppText style={styles.symptomDataText}>{this.props.data}</AppText>
        </View>
      </TouchableOpacity>
    )
  }
}

class FillerBoxes extends Component {
  render() {
    const n = Dimensions.get('window').width / styles.symptomBox.width
    const fillerBoxes = []
    for (let i = 0; i < Math.ceil(n); i++) {
      fillerBoxes.push(
        <View
          width={styles.symptomBox.width}
          height={0}
          key={i.toString()}
        />
      )
    }
    return fillerBoxes
  }
}

function isNumber(val) {
  return typeof val === 'number'
}