/* eslint class-methods-use-this: 0 */
import PropTypes from 'prop-types';
import React from 'react';
import SplitPane from 'react-split-pane';

// @todo import this in storybook for 1x injection
import '../splitpane.css';

import ControlPanel, { width as CONTROLS_WIDTH } from './ControlPanel';
import Visualization, { margin as VIS_MARGIN } from './Visualization';

import { findNthIndexOfX } from '../utils/data-utils';
import { buildGraph } from '../utils/graph-utils';
import { buildAllScales } from '../utils/scale-utils';
import { dataShape } from '../propShapes';

import {
  ANY_EVENT_TYPE,
  EVENT_NAME,
  ELAPSED_TIME_SCALE,
  EVENT_COUNT_SCALE,
  NODE_COLOR_SCALE,
} from '../constants';

const propTypes = {
  data: dataShape,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

const defaultProps = {
  data: [],
};

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onToggleShowControls = this.onToggleShowControls.bind(this);
    this.handleAlignByIndex = this.handleAlignByIndex.bind(this);
    this.handleAlignByEventType = this.handleAlignByEventType.bind(this);

    const { width, height, data } = props;
    const visualizationWidth = this.getVisualizationWidth(width, true);
    const alignByEventType = ANY_EVENT_TYPE;
    const alignByIndex = 1;
    const graph = this.getGraph(data, alignByIndex, alignByEventType);
    const scales = this.getScales(graph, visualizationWidth, height);

    this.state = {
      alignByIndex,
      alignByEventType,
      xScaleType: ELAPSED_TIME_SCALE,
      yScaleType: EVENT_COUNT_SCALE,
      showControls: true,
      visualizationWidth,
      graph,
      scales,
    };
  }

  onComponentWillReceiveProps(nextProps) {
    const nextState = {};
    if (this.props.data !== nextProps.data) {
      const { alignByIndex, alignByEventType } = this.state;
      nextState.graph = this.getGraph(nextProps.data, alignByIndex, alignByEventType);
    }
    if (
      this.props.width !== nextProps.width ||
      this.props.height !== nextProps.height ||
      nextState.graph
    ) {
      const { showControls, graph } = this.state;
      nextState.visualizationWidth = nextProps.width - (showControls ? CONTROLS_WIDTH : 0);
      nextState.scales = this.getScales(
        nextState.graph || graph,
        nextState.visualizationWidth,
        nextProps.height,
      );
    }
    if (Object.keys(nextState).length > 0) {
      this.setState(nextState);
    }
  }

  onToggleShowControls() {
    const { width, height } = this.props;
    const { showControls: prevShowControls, graph } = this.state;
    const showControls = !prevShowControls;
    const visualizationWidth = this.getVisualizationWidth(width, showControls);

    this.setState({
      visualizationWidth,
      scales: this.getScales(graph, visualizationWidth, height),
      showControls,
    });
  }

  getVisualizationWidth(width, showControls) {
    return width - (showControls ? CONTROLS_WIDTH + VIS_MARGIN.right : 0);
  }

  getGraph(data, alignByIndex, alignByEventType) {
    // the graph is built from a root event derived from event type + index
    return buildGraph(data, events => findNthIndexOfX(events, alignByIndex, event => (
      alignByEventType === ANY_EVENT_TYPE || event[EVENT_NAME] === alignByEventType
    )));
  }

  getScales(graph, width, height) {
    const innerWidth = width - VIS_MARGIN.left - VIS_MARGIN.right;
    const innerHeight = height - VIS_MARGIN.top - VIS_MARGIN.bottom;
    console.time('buildScales');
    const scales = buildAllScales(graph, innerWidth, innerHeight);
    console.timeEnd('buildScales');
    return scales;
  }

  handleAlignByIndex(alignByIndex) {
    const { data, height } = this.props;
    const { alignByEventType, visualizationWidth } = this.state;
    const graph = this.getGraph(data, alignByIndex, alignByEventType);
    const scales = this.getScales(graph, visualizationWidth, height);
    this.setState({ alignByIndex, graph, scales });
  }

  handleAlignByEventType(alignByEventType) {
    const { data, height } = this.props;
    const { alignByIndex, visualizationWidth } = this.state;
    const graph = this.getGraph(data, alignByIndex, alignByEventType);
    const scales = this.getScales(graph, visualizationWidth, height);
    this.setState({ alignByEventType, graph, scales });
  }

  render() {
    const {
      alignByIndex,
      alignByEventType,
      graph,
      scales,
      showControls,
      xScaleType,
      yScaleType,
      visualizationWidth,
    } = this.state;

    const { width, height } = this.props;

    return (
      <div style={{ position: 'relative', width, height }}>
        <SplitPane
          size={visualizationWidth}
          split="vertical"
        >
          <Visualization
            width={visualizationWidth}
            height={height}
            graph={graph}
            xScale={scales[xScaleType]}
            yScale={scales[yScaleType]}
            colorScale={scales[NODE_COLOR_SCALE]}
          />
          <ControlPanel
            showControls={showControls}
            alignByIndex={alignByIndex}
            alignByEventType={alignByEventType}
            colorScale={scales[NODE_COLOR_SCALE]}
            xScaleType={xScaleType}
            yScaleType={yScaleType}
            onToggleShowControls={this.onToggleShowControls}
            onChangeAlignByEventType={this.handleAlignByEventType}
            onChangeAlignByIndex={this.handleAlignByIndex}
            onChangeXScale={(type) => { this.setState({ xScaleType: type }); }}
            onChangeYScale={(type) => { this.setState({ yScaleType: type }); }}
          />
        </SplitPane>
      </div>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;