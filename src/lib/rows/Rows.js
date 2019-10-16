import React from 'react'
import TimelineStateContext from '../timeline/TimelineStateContext'
import { ColumnsContextProvider } from '../columns/ColumnsContext'
import { _get, _length } from '../utility/generic'
import GroupRow from './GroupRow'
import { ItemsContextProvider } from '../items/ItemsContext'
import { GroupRowContextProvider } from './GroupRowContext'

class Rows extends React.Component {
  static contextType = TimelineStateContext

  initState = {
    dragging: false,
    resizing: false,
    dragOffset: 0,
    interactingItemId: undefined
  }

  state = this.initState

  handleDragStart = (dragging, dragOffset, itemId) => {
    this.setState({
      dragging,
      dragOffset,
      interactingItemId: itemId
    })
  }

  clearState = () => {
    this.setState(this.initState)
  }

  handleResizeEnd = (itemId, resizeTime, resizeEdge, timeDelta) => {
    this.props.itemResized(itemId, resizeTime, resizeEdge, timeDelta)
    this.clearState()
  }

  handleDragEnd = () => {
    this.clearState()
  }

  handleResizeStart = (resizing, itemId) => {
    this.setState({
      resizing,
      interactingItemId: itemId
    })
  }

  //TODO: make this faster
  getGroupByItemId = itemId => {
    const { items, keys } = this.props
    const item = items.find(i => _get(i, keys.itemIdKey) === itemId)
    const groupId = _get(item, keys.itemGroupKey)
    return groupId
  }

  getItemDimensionsHelper = itemId => {
    const { groupsWithItemsDimensions } = this.props
    const groupId = this.getGroupByItemId(itemId)
    const group = groupsWithItemsDimensions[groupId]
    const itemDimensions = group.itemDimensions.find(i => i.id === itemId)
    if (itemDimensions) return itemDimensions.dimensions
    else return undefined
  }

  getItemAbsoluteLocation = itemId => {
    const { groupsWithItemsDimensions } = this.props
    const { groupHeights } = this.props
    const groupId = this.getGroupByItemId(itemId)
    const group = groupsWithItemsDimensions[groupId]
    const itemDimensions = group.itemDimensions.find(i => i.id === itemId)
    if (!itemDimensions) return
    const groupIndex = group.index
    const groupTop = groupHeights.reduce((acc, height, index) => {
      if (index < groupIndex) return acc + height
      else return acc
    }, 0)
    return {
      left: itemDimensions.dimensions.left,
      top: groupTop + itemDimensions.dimensions.top
    }
  }

  getLayerRootProps = () => {
    return {
      style: {
        // height: '100%'
      }
    }
  }

  render() {
    const {
      groupHeights,
      groups,
      itemRenderer,
      lineHeight,
      itemHeightRatio,
      stackItems,
      canChangeGroup,
      canMove,
      canResize,
      canSelect,
      useResizeHandle,
      groupTops,
      dragSnap,
      minResizeWidth,
      itemResizing,
      moveResizeValidator,
      itemDrag,
      itemDrop,
      onItemDoubleClick,
      onItemContextMenu,
      itemSelect,
      scrollRef,
      itemResized,
      selected,
      selectedItem,
      verticalLineClassNamesForTime,
      timeSteps,
      minUnit,
      rowRenderer: Layers,
      rowData,
      groupsWithItemsDimensions,
      //row props
      clickTolerance,
      onRowClick,
      onRowDoubleClick,
      horizontalLineClassNamesForGroup,
      onRowContextClick,
      items,
      keys
    } = this.props
    const {
      getTimelineState,
      getLeftOffsetFromDate,
      getDateFromLeftOffsetPosition
    } = this.context
    const {
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      timelineUnit,
      timelineWidth,
      resizeEdge,
      resizeTime
    } = getTimelineState()

    return (
      <div style={{ position: 'absolute', top: 0 }}>
        {groupHeights.map((groupHeight, i) => {
          const groupId = _get(groups[i], keys.groupIdKey)
          const group = groupsWithItemsDimensions[groupId]
          return (
            <GroupRowContextProvider
              key={`horizontal-line-${groupId}`}
              clickTolerance={clickTolerance}
              onContextMenu={evt => onRowContextClick(evt, i)}
              onClick={evt => onRowClick(evt, i)}
              onDoubleClick={evt => onRowDoubleClick(evt, i)}
              isEvenRow={i % 2 === 0}
              group={groups[i]}
              horizontalLineClassNamesForGroup={
                horizontalLineClassNamesForGroup
              }
              groupHeight={groupHeight}
            >
              <ColumnsContextProvider
                lineCount={_length(groups)}
                minUnit={minUnit}
                timeSteps={timeSteps}
                height={groupHeight}
                verticalLineClassNamesForTime={verticalLineClassNamesForTime}
              >
                <ItemsContextProvider
                  //TODO: fix groups with no items
                  items={group.items || []}
                  dragSnap={dragSnap}
                  minResizeWidth={minResizeWidth}
                  selectedItem={selectedItem}
                  canChangeGroup={canChangeGroup}
                  canMove={canMove}
                  canResize={canResize}
                  canSelect={canSelect}
                  moveResizeValidator={moveResizeValidator}
                  itemSelect={itemSelect}
                  itemDrag={itemDrag}
                  itemDrop={itemDrop}
                  itemResizing={itemResizing}
                  itemResized={this.handleResizeEnd}
                  onItemDoubleClick={onItemDoubleClick}
                  onItemContextMenu={onItemContextMenu}
                  itemRenderer={itemRenderer}
                  selected={selected}
                  groupDimensions={group}
                  useResizeHandle={useResizeHandle}
                  scrollRef={scrollRef}
                  order={group}
                  onDragStart={this.handleDragStart}
                  onDragEnd={this.handleDragEnd}
                  onResizeStart={this.handleResizeStart}
                  resizeEdge={resizeEdge}
                  resizeTime={resizeTime}
                  dragging={this.state.dragging}
                  resizing={this.state.resizing}
                  dragOffset={this.state.dragOffset}
                  interactingItemId={this.state.interactingItemId}
                >
                  <Layers
                    getLayerRootProps={this.getLayerRootProps}
                    helpers={{
                      getLeftOffsetFromDate: getLeftOffsetFromDate,
                      getDateFromLeftOffsetPosition: this
                        .getDateFromLeftOffsetPosition,
                      getItemAbsoluteLocation: this.getItemAbsoluteLocation,
                      getItemDimensions: this.getItemDimensionsHelper
                    }}
                    rowData={rowData}
                    group={group.group}
                    itemsWithInteractions={items}
                  />
                </ItemsContextProvider>
              </ColumnsContextProvider>
            </GroupRowContextProvider>
          )
        })}
      </div>
    )
  }
}

export default Rows
