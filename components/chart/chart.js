import React, { Component } from 'react'
import { Text as ReactNativeText, View, FlatList, ScrollView } from 'react-native'
import range from 'date-range'
import Svg,{
  G,
  Rect,
  Text,
  Circle,
  Line,
  Path
} from 'react-native-svg'
import { LocalDate } from 'js-joda'
import { getCycleDay, getOrCreateCycleDay, cycleDaysSortedByDate } from '../../db'
import cycleModule from '../../lib/cycle'
import styles from './styles'
import config from './config'
import { getCycleStatusForDay } from '../../lib/sympto-adapter'

const getCycleDayNumber = cycleModule().getCycleDayNumber

const yAxis = makeYAxis(config)

export default class CycleChart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      columns: makeColumnInfo(config.xAxisRangeInDays)
    }

    this.reCalculateChartInfo = (function(Chart) {
      return function() {
        Chart.setState({columns: makeColumnInfo(config.xAxisRangeInDays)})
      }
    })(this)

    cycleDaysSortedByDate.addListener(this.reCalculateChartInfo)
  }

  componentWillUnmount() {
    cycleDaysSortedByDate.removeListener(this.reCalculateChartInfo)
  }

  passDateToDayView(dateString) {
    const cycleDay = getOrCreateCycleDay(dateString)
    this.props.navigation.navigate('cycleDay', { cycleDay })
  }

  placeHorizontalGrid() {
    return yAxis.tickPositions.map(tick => {
      return (
        <Line
          x1={0}
          y1={tick}
          x2={config.columnWidth}
          y2={tick}
          {...styles.horizontalGrid}
          key={tick}
        />
      )
    })
  }

  makeDayColumn({ dateString, cycleDay, y }, index) {
    const cycleDayNumber = getCycleDayNumber(dateString)
    const label = styles.column.label
    const dateLabel = dateString.split('-').slice(1).join('-')
    const getFhmAndLtlInfo = setUpFertilityStatusFunc()
    const nfpLineInfo = getFhmAndLtlInfo(dateString, cycleDay)

    return (
      <G onPress={() => this.passDateToDayView(dateString)}>
        <Rect {...styles.column.rect} />
        {nfpLineInfo.drawFhmLine ?
          <Line
            x1={0 + styles.nfpLine.strokeWidth / 2}
            y1="20"
            x2={0 + styles.nfpLine.strokeWidth / 2}
            y2={config.chartHeight - 20}
            {...styles.nfpLine}
          /> : null}

        {this.placeHorizontalGrid()}

        <Text {...label.number} y={config.cycleDayNumberRowY}>
          {cycleDayNumber}
        </Text>
        <Text {...label.date} y={config.dateRowY}>
          {dateLabel}
        </Text>

        {cycleDay && cycleDay.bleeding ?
          <Path {...styles.bleedingIcon}
            d="M15 3
              Q16.5 6.8 25 18
              A12.8 12.8 0 1 1 5 18
              Q13.5 6.8 15 3z" />
          : null}

        {nfpLineInfo.drawLtlAt ?
          <Line
            x1="0"
            y1={nfpLineInfo.drawLtlAt}
            x2={config.columnWidth}
            y2={nfpLineInfo.drawLtlAt}
            {...styles.nfpLine}
          /> : null}

        {y ?
          this.drawDotAndLines(y, cycleDay.temperature.exclude, index)
          : null
        }
        {cycleDay && cycleDay.mucus ?
          <Circle
            {...styles.mucusIcon}
            fill={styles.mucusIconShades[cycleDay.mucus.value]}
          /> : null}

        {y ? this.drawDotAndLines(y, cycleDay.temperature.exclude, index) : null}
      </G>
    )
  }

  drawDotAndLines(currY, exclude, index) {
    let lineToRight
    let lineToLeft
    const cols = this.state.columns

    function makeLine(otherColY, x, excludeLine) {
      const middleY = ((otherColY - currY) / 2) + currY
      const target = [x, middleY]
      const lineStyle = excludeLine ? styles.curveExcluded : styles.curve

      return <Line
        x1={config.columnMiddle}
        y1={currY}
        x2={target[0]}
        y2={target[1]}
        {...lineStyle}
      />
    }

    const thereIsADotToTheRight = index > 0 && cols[index - 1].y
    const thereIsADotToTheLeft = index < cols.length - 1 && cols[index + 1].y

    if (thereIsADotToTheRight) {
      const otherDot = cols[index - 1]
      const excludedLine = otherDot.cycleDay.temperature.exclude || exclude
      lineToRight = makeLine(otherDot.y, config.columnWidth, excludedLine)
    }
    if (thereIsADotToTheLeft) {
      const otherDot = cols[index + 1]
      const excludedLine = otherDot.cycleDay.temperature.exclude || exclude
      lineToLeft = makeLine(otherDot.y, 0, excludedLine)
    }

    const dotStyle = exclude ? styles.curveDotsExcluded : styles.curveDots
    return (<G>
      {lineToRight}
      {lineToLeft}
      <Circle
        cx={config.columnMiddle}
        cy={currY}
        {...dotStyle}
      />
    </G>)
  }

  render() {
    return (
      <ScrollView contentContainerStyle={{flexDirection: 'row'}}>
        <View {...styles.yAxis}>{yAxis.labels}</View>
        <FlatList
          horizontal={true}
          inverted={true}
          showsHorizontalScrollIndicator={false}
          data={this.state.columns}
          renderItem={({ item, index }) => {
            return (
              <Svg width={config.columnWidth} height={config.chartHeight}>
                {this.makeDayColumn(item, index)}
              </Svg>
            )
          }}
          keyExtractor={item => item.dateString}
        >
        </FlatList>
      </ScrollView>
    )
  }
}

function makeColumnInfo(n) {
  const xAxisDates = getPreviousDays(n).map(jsDate => {
    return LocalDate.of(
      jsDate.getFullYear(),
      jsDate.getMonth() + 1,
      jsDate.getDate()
    ).toString()
  })

  return xAxisDates.map(dateString => {
    const cycleDay = getCycleDay(dateString)
    const temp = cycleDay && cycleDay.temperature && cycleDay.temperature.value
    return {
      dateString,
      cycleDay,
      y: temp ? normalizeToScale(temp) : null
    }
  })
}

function getPreviousDays(n) {
  const today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  today.setMilliseconds(0)
  const earlierDate = new Date(today - (range.DAY * n))

  return range(earlierDate, today).reverse()
}

function normalizeToScale(temp) {
  const scale = config.temperatureScale
  const valueRelativeToScale = (scale.high - temp) / (scale.high - scale.low)
  const scaleHeight = config.chartHeight
  return scaleHeight * valueRelativeToScale
}

function makeYAxis() {
  const scaleMin = config.temperatureScale.low
  const scaleMax = config.temperatureScale.high
  const numberOfTicks = (scaleMax - scaleMin) * 2
  const tickDistance = config.chartHeight / numberOfTicks

  const tickPositions = []
  const labels = []
  // for style reasons, we don't want the first and last tick
  for (let i = 1; i < numberOfTicks - 1; i++) {
    const y = tickDistance * i
    const style = styles.yAxisLabel
    // this eyeballing is sadly necessary because RN does not
    // support percentage values for transforms, which we'd need
    // to reliably place the label vertically centered to the grid
    style.top = y - 8
    labels.push(
      <ReactNativeText
        style={{...style}}
        key={i}>
        {scaleMax - i * 0.5}
      </ReactNativeText>
    )
    tickPositions.push(y)
  }

  return {labels, tickPositions}
}

function setUpFertilityStatusFunc() {
  let cycleStatus
  let cycleStartDate
  let noMoreCycles = false

  function updateCurrentCycle(dateString) {
    cycleStatus = getCycleStatusForDay(dateString)
    if(!cycleStatus) {
      noMoreCycles = true
      return
    }
    if (cycleStatus.phases.preOvulatory) {
      cycleStartDate = cycleStatus.phases.preOvulatory.start.date
    } else {
      cycleStartDate = cycleStatus.phases.periOvulatory.start.date
    }
  }

  function dateIsInPeriOrPostPhase(dateString) {
    return (
      dateString >= cycleStatus.phases.periOvulatory.start.date
    )
  }

  function precededByAnotherTempValue(dateString) {
    return (
      // we are only interested in days that have a preceding
      // temp
      Object.keys(cycleStatus.phases).some(phaseName => {
        return cycleStatus.phases[phaseName].cycleDays.some(day => {
          return day.temperature && day.date < dateString
        })
      })
      // and also a following temp, so we don't draw the line
      // longer than necessary
      &&
      cycleStatus.phases.postOvulatory.cycleDays.some(day => {
        return day.temperature && day.date > dateString
      })
    )
  }

  function isInTempMeasuringPhase(cycleDay, dateString) {
    return (
      cycleDay && cycleDay.temperature
      || precededByAnotherTempValue(dateString)
    )
  }

  return function(dateString, cycleDay) {
    const ret = {}
    if (!cycleStatus && !noMoreCycles) updateCurrentCycle(dateString)
    if (noMoreCycles) return ret

    if (dateString < cycleStartDate) updateCurrentCycle(dateString)
    if (noMoreCycles) return ret

    const tempShift = cycleStatus.temperatureShift

    if (tempShift) {
      if (tempShift.firstHighMeasurementDay.date === dateString) {
        ret.drawFhmLine = true
      }

      if (
        dateIsInPeriOrPostPhase(dateString) &&
        isInTempMeasuringPhase(cycleDay, dateString)
      ) {
        ret.drawLtlAt = normalizeToScale(tempShift.ltl)
      }
    }

    return ret
  }
}