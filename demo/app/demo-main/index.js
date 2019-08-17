/* eslint-disable no-console */
import React, { Component } from 'react'
import moment from 'moment'

import Timeline, {
  TimelineMarkers,
  TimelineHeaders,
  TodayMarker,
  CustomMarker,
  CursorMarker,
  CustomHeader,
  SidebarHeader,
  DateHeader
} from 'react-calendar-timeline'
import {useDrag, useDrop} from 'react-dnd'

import generateFakeData from '../generate-fake-data'

var minTime = moment()
  .add(-6, 'months')
  .valueOf()
var maxTime = moment()
  .add(6, 'months')
  .valueOf()

var keys = {
  groupIdKey: 'id',
  groupTitleKey: 'title',
  groupRightTitleKey: 'rightTitle',
  itemIdKey: 'id',
  itemTitleKey: 'title',
  itemDivTitleKey: 'title',
  itemGroupKey: 'group',
  itemTimeStartKey: 'start',
  itemTimeEndKey: 'end'
}

export default class App extends Component {
  constructor(props) {
    super(props)

    const { groups, items } = generateFakeData(3, 2, 1)
    console.log(items)
    const defaultTimeStart = moment()
      .startOf('day')
      .toDate()
    const defaultTimeEnd = moment()
      .startOf('day')
      .add(1, 'day')
      .toDate()

    this.state = {
      groups,
      items,
      defaultTimeStart,
      defaultTimeEnd,
      itemsToDrag: [
        {
          title: 'print',
          id: '0',
          slots: [
            {
              groupId: '0',
              startTime: moment()
                .startOf('day')
                .add(2, 'h'),
              endTime: moment()
                .startOf('day')
                .add(4, 'h')
            },
            {
              groupId: '2',
              startTime: moment()
                .startOf('day')
                .add(8, 'h'),
              endTime: moment()
                .startOf('day')
                .add(16, 'h')
            }
          ]
        },
        {
          title: 'cut',
          id: '1',
          slots: [
            {
              groupId: '1',
              startTime: moment()
                .startOf('day')
                .add(9, 'h'),
              endTime: moment()
                .startOf('day')
                .add(18, 'h')
            },
            {
              groupId: '2',
              startTime: moment()
                .startOf('day')
                .add(2, 'h'),
              endTime: moment()
                .startOf('day')
                .add(10, 'h')
            }
          ]
        },
        {
          title: 'fold',
          id: '2',
          slots: [
            {
              groupId: '2',
              startTime: moment()
                .startOf('day')
                .add(9, 'h'),
              endTime: moment()
                .startOf('day')
                .add(18, 'h')
            },
            {
              groupId: '2',
              startTime: moment()
                .startOf('day')
                .add(2, 'h'),
              endTime: moment()
                .startOf('day')
                .add(8, 'h')
            }
          ]
        }
      ]
    }
  }

  handleCanvasClick = (groupId, time) => {
    console.log('Canvas clicked', groupId, moment(time).format())
  }

  handleCanvasDoubleClick = (groupId, time) => {
    console.log('Canvas double clicked', groupId, moment(time).format())
  }

  handleCanvasContextMenu = (group, time) => {
    console.log('Canvas context menu', group, moment(time).format())
  }

  handleItemClick = (itemId, _, time) => {
    console.log('Clicked: ' + itemId, moment(time).format())
  }

  handleItemSelect = (itemId, _, time) => {
    console.log('Selected: ' + itemId, moment(time).format())
  }

  handleItemDoubleClick = (itemId, _, time) => {
    console.log('Double Click: ' + itemId, moment(time).format())
  }

  handleItemContextMenu = (itemId, _, time) => {
    console.log('Context Menu: ' + itemId, moment(time).format())
  }

  handleItemMove = (itemId, dragTime, newGroupOrder) => {
    const { items, groups } = this.state

    const group = groups[newGroupOrder]

    this.setState({
      items: items.map(
        item =>
          item.id === itemId
            ? Object.assign({}, item, {
                start: dragTime,
                end: dragTime + (item.end - item.start),
                group: group.id
              })
            : item
      )
    })

    console.log('Moved', itemId, dragTime, newGroupOrder)
  }

  handleItemResize = (itemId, time, edge) => {
    const { items } = this.state

    this.setState({
      items: items.map(
        item =>
          item.id === itemId
            ? Object.assign({}, item, {
                start: edge === 'left' ? time : item.start,
                end: edge === 'left' ? item.end : time
              })
            : item
      )
    })

    console.log('Resized', itemId, time, edge)
  }

  // this limits the timeline to -6 months ... +6 months
  handleTimeChange = (visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
    if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
      updateScrollCanvas(minTime, maxTime)
    } else if (visibleTimeStart < minTime) {
      updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart))
    } else if (visibleTimeEnd > maxTime) {
      updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime)
    } else {
      updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
    }
  }

  moveResizeValidator = (action, item, time) => {
    if (time < new Date().getTime()) {
      var newTime =
        Math.ceil(new Date().getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000)
      return newTime
    }

    return time
  }

  handleDrop = (item, slot) => {
    const fullItem = this.state.itemsToDrag.find(i => i.id === item.id)
    this.setState(state => ({
      itemsToDrag: state.itemsToDrag.filter( i => item.id !== i.id),
      items: [...state.items, {
        title: fullItem.title,
        id: item.id,
        group: slot.groupId,
        start: slot.startTime.valueOf(),
        end: slot.endTime.valueOf()
      }]
    }))
  }

  render() {
    const { groups, items, defaultTimeStart, defaultTimeEnd } = this.state

    return (
      <Timeline
        groups={groups}
        items={items}
        keys={keys}
        sidebarWidth={150}
        sidebarContent={<div>Above The Left</div>}
        canMove
        canResize="right"
        canSelect
        itemsSorted
        itemTouchSendsClick={false}
        stackItems
        itemHeightRatio={0.75}
        defaultTimeStart={defaultTimeStart}
        defaultTimeEnd={defaultTimeEnd}
        onCanvasClick={this.handleCanvasClick}
        onCanvasDoubleClick={this.handleCanvasDoubleClick}
        onCanvasContextMenu={this.handleCanvasContextMenu}
        onItemClick={this.handleItemClick}
        onItemSelect={this.handleItemSelect}
        onItemContextMenu={this.handleItemContextMenu}
        onItemMove={this.handleItemMove}
        onItemResize={this.handleItemResize}
        onItemDoubleClick={this.handleItemDoubleClick}
        onTimeChange={this.handleTimeChange}
        rowRenderer={({ rowData, helpers, getLayerRootProps, group }) => {
          const { itemsToDrag } = rowData
          return (
            <>
              <div {...getLayerRootProps()}>
                {itemsToDrag.map(item => {
                  return item.slots
                    .filter(slot => slot.groupId === group.id)
                    .map(slot => {
                      const left = helpers.getLeftOffsetFromDate(
                        slot.startTime.valueOf()
                      )
                      const right = helpers.getLeftOffsetFromDate(
                        slot.endTime.valueOf()
                      )
                      return (
                        <Droppable
                          style={{
                            position: 'absolute',
                            left: left,
                            width: right - left,
                            backgroundColor: 'purple',
                            height: '100%'
                          }}
                          itemIdAccepts={item.id}
                          slot={slot}
                          onDrop={this.handleDrop}
                        >
                          {item.title}
                        </Droppable>
                      )
                    })
                })}
              </div>
            </>
          )
        }}
        rowData={{ itemsToDrag: this.state.itemsToDrag }}
        // moveResizeValidator={this.moveResizeValidator}
      >
        <TimelineHeaders>
          <DateHeader />
          <CustomHeader
            headerData={{
              itemsToDrag: this.state.itemsToDrag
            }}
          >
            {({
              headerContext: { intervals },
              getRootProps,
              getIntervalProps,
              showPeriod,
              getLeftOffsetFromDate,
              data: { itemsToDrag }
            }) => {
              return (
                <div {...getRootProps()}>
                  <div
                    style={{
                      height: '100%',
                      position: 'absolute',
                      left: getLeftOffsetFromDate(
                        moment()
                          .startOf('day')
                          .valueOf()
                      ),
                      display: 'flex'
                    }}
                  >
                    {itemsToDrag.map(dragItem => {
                      return (
                        <Draggable
                          key={dragItem.id}
                          id={dragItem.id}
                          style={{
                            height: '100%',
                            width: 100,
                            background: 'white',
                            marginLeft: 15,
                            border: '1px solid white'
                          }}
                          onDragEnd={(item)=>console.log('dragEnd',item)}
                          onDragStart={(item)=>console.log('dragStart',item)}
                        >
                          {dragItem.title}
                        </Draggable>
                      )
                    })}
                  </div>
                </div>
              )
            }}
          </CustomHeader>
        </TimelineHeaders>
        <TimelineMarkers>
          <TodayMarker />
          <CustomMarker
            date={
              moment()
                .startOf('day')
                .valueOf() +
              1000 * 60 * 60 * 2
            }
          />
          <CustomMarker
            date={moment()
              .add(3, 'day')
              .valueOf()}
          >
            {({ styles }) => {
              const newStyles = { ...styles, backgroundColor: 'blue' }
              return <div style={newStyles} />
            }}
          </CustomMarker>
          <CursorMarker />
        </TimelineMarkers>
      </Timeline>
    )
  }
}

function Droppable({children, itemIdAccepts, style, slot, onDrop, ...rest}) {
  const [collected, droppableRef] = useDrop({
    drop: (item, monitor) => {
      onDrop(item, slot)
    },
    accept: itemIdAccepts,
    collect: (monitor) => ({
      canDrop: monitor.canDrop()
    })
  })
  const isVisable = collected.canDrop 
  return <div style={{
    ...style,
    display: isVisable? 'initial': 'none'
  }} ref={droppableRef} {...rest}>
    {children}
  </div>
}

function Draggable({id, children, onDragStart, onDragEnd, ...rest}) {
  const [collectedProps, dragRef] = useDrag({
    item: { id, type: id },
    begin: (monitor) => {
      onDragStart(id)
    },
    end: (item, monitor) => {
      console.log(monitor)
      onDragEnd(item)
    }
  })
  return <div {...rest} ref={dragRef} >
    {children}
  </div>
}
