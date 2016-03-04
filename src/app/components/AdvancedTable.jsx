import _ from 'lodash'

import React from 'react'

import {Mixins, IconButton} from 'material-ui'
const {StylePropable, StyleResizable} = Mixins
import {Table, TableHeaderColumn, TableRow, TableHeader, TableRowColumn, TableBody, TableFooter} from 'material-ui'
import {NavigationArrowDropDown, NavigationArrowDropUp} from 'material-ui/lib/svg-icons'

export default React.createClass({

  propTypes: {
    onChangeMuiTheme: React.PropTypes.func,
    columns: React.PropTypes.array,
    data: React.PropTypes.array,
    initialSortField: React.PropTypes.string,
    initialSortAscending: React.PropTypes.bool,
    //RowToolbarClass: React.PropTypes.element,
    rowToolbarWidth: React.PropTypes.number,
    height: React.PropTypes.string,
    baseCellStyle: React.PropTypes.object,
    cellStyleCallback: React.PropTypes.func,
  },

  contextTypes: {
    muiTheme: React.PropTypes.object,
  },

  mixins: [StylePropable, StyleResizable],

  onHeaderTouch(event) {
    let label = event.target.textContent
    let touchedColumn
    if (_.isString(label)) {
      let oldSortField = this.state.sort.field
      let oldSortAscending = this.state.sort.ascending
      for (let column of this.props.columns) {
        if (label === column.label || label===column.tooltip + column.label) {
          touchedColumn = column
          break
        }
      }
      if (touchedColumn) {
        let newSortField, newSortAscending, sortedData
        if (touchedColumn.field === oldSortField) {
          newSortField = oldSortField
          newSortAscending = ! oldSortAscending
          sortedData = this.state.sortedData
          sortedData.reverse()
        } else {
          newSortField = touchedColumn.field
          newSortAscending = true
          sortedData = _.sortBy(this.state.sortedData, newSortField)
          if (newSortAscending) {
            sortedData.reverse()
          }
        }
        this.setState({
          sort: {
            field: newSortField,
            ascending: newSortAscending,
          },
          sortedData
        })


      }
    }
  },

  transformData(originalData) {
    let data
    if (originalData.length === 0) {
      return originalData
    }
    let firstRow = originalData[0]
    if (_.isPlainObject(firstRow)) {
      data = originalData
    } else if (_.isArray(firstRow)) {
      throw new Error('Arrays of arrays not yet supported by Advanced Table, but should be easy to upgrade')
    } else {  // Assume that it's a single column array
      if (this.props.columns.length > 1) {
        throw new Error('Number of columns does not match data')
      }
      data = []
      for (let row of originalData) {
        let o = {}
        o[this.props.columns[0].field] = row
        data.push(o)
      }
    }
    return data
  },

  getInitialState() {
    let data = this.transformData(this.props.data)
    let sort = {
      field: this.props.initialSortField || this.props.columns[0].field,
      ascending: this.props.initialSortAscending || false,
    }
    let sortedData = _.sortBy(data, sort.field)
    if (sort.ascending) {
      sortedData.reverse()
    }
    return {sort, sortedData}
  },

  componentWillReceiveProps(nextProps) {
    let data = this.transformData(nextProps.data)
    let sortedData = _.sortBy(data, this.state.sort.field)
    if (this.state.sort.ascending) {
      sortedData.reverse()
    }
    this.setState({
      sortedData
    })
  },

  getCellStyle(value){
    let baseCellStyle = this.props.baseCellStyle || {}
    if (this.props.cellStyleCallback) {
      return this.mergeStyles(baseCellStyle, this.props.cellStyleCallback(value))
    } else {
      return baseCellStyle
    }
  },

  render() {
    let columns = this.props.columns
    return (
      <Table
        fixedHeader={true}
        fixedFooter={false}
        selectable={false}
        height={this.props.height}
        style={this.props.style}
      >
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow key={0} style={{color: "#000000", backgroundColor: "#CCCCCC"}}>
            {columns.map((field, index) => {
              if (! field.hidden) {
                let sortIcon
                if (field.field === this.state.sort.field) {
                  if (this.state.sort.ascending) {
                    sortIcon = <NavigationArrowDropDown viewBox="0 0 17 17"/>
                  } else {
                    sortIcon = <NavigationArrowDropUp viewBox="0 0 17 17"/>
                  }
                }
                return (
                  <TableHeaderColumn onTouchTap={this.onHeaderTouch} key={index} style={{fontSize: "16"}}
                                     tooltip={field.tooltip}>
                    <div style={{height: "50px", lineHeight: "50px"}}>{field.label}{sortIcon}</div>
                  </TableHeaderColumn>
                )
              }
            })}
            <TableHeaderColumn style={{width: this.props.rowToolbarWidth}}></TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          showRowHover={false}
          stripedRows={false}
          displayRowCheckbox={false}
          style={{backgroundColor: '#FFFFFF', color: "#AAAAAA"}}
        >
          {this.state.sortedData.map( (detailRow, index) => {
            return (
              <TableRow
                key={index}
                selected={detailRow.selected}
                style={{color: "#000000"}} >
                {columns.map((field, index) => {
                  if (! field.hidden) {
                    return (
                      <TableRowColumn style={this.getCellStyle(detailRow[field.field])} selectable={false}
                                      key={field.field}>{detailRow[field.field]}</TableRowColumn>
                    )
                  }
                })}
                <TableRowColumn key="rowActions" style={{width: this.props.rowToolbarWidth}}>
                  {React.createElement(this.props.RowToolbarClass, {parent: this.props.parent, value: detailRow[this.props.valueField]})}
                </TableRowColumn>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }

})