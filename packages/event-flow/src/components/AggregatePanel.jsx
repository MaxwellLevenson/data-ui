import { Group } from '@vx/group';
import React from 'react';
import PropTypes from 'prop-types';

import { event as d3Event, select as d3Select } from 'd3-selection';
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';

import { graphShape, scaleShape } from '../propShapes';
import { timeUnitFromTimeExtent, formatInterval } from '../utils/scale-utils';

import SubTree from './SubTree';
import Tooltip from './Tooltip';
import XAxis from './XAxis';
import YAxis from './YAxis';
import ZeroLine from './ZeroLine';

export const margin = {
  top: XAxis.height,
  right: 30,
  bottom: 30,
  left: YAxis.width,
};

const ZOOM_SCALE_EXTENT = [1, 40];

const propTypes = {
  graph: graphShape.isRequired,
  xScale: scaleShape.isRequired,
  yScale: scaleShape.isRequired,
  colorScale: scaleShape.isRequired,

  onClickNode: PropTypes.func,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

const defaultProps = {
  onClickNode: () => {},
};

class AggregatePanel extends React.PureComponent {
  static clearedState() {
    return {
      xScaleZoomed: null,
      yScaleZoomed: null,
      viewTransform: null,
      tooltip: null,
    };
  }

  constructor(props) {
    super(props);

    this.resetZoom = this.resetZoom.bind(this);
    this.panOrZoom = this.panOrZoom.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);

    this.zoom = d3Zoom()
      .scaleExtent(ZOOM_SCALE_EXTENT)
      .on('zoom', this.panOrZoom);

    this.state = {
      ...AggregatePanel.clearedState(),
    };
  }

  componentDidMount() {
    this.zoom(d3Select(this.svg)); // this attaches all zoom-related listeners to the view ref
    this.resetZoom();
  }

  componentWillReceiveProps(nextProps) {
    this.resetZoom(nextProps);
    this.setState({ ...AggregatePanel.clearedState() });
  }

  onMouseOver({ node, link, coords }) {
    this.setState({
      tooltip: { coords, node, link },
    });
  }

  onMouseOut() {
    this.setState({ tooltip: null });
  }

  resetZoom(props) {
    const innerWidth = (props || this.props).width - margin.left - margin.right;
    const innerHeight = (props || this.props).height - margin.top - margin.bottom;

    this.zoom.translateExtent([[0, 0], [innerWidth, innerHeight]]);
    this.zoom.extent([[0, 0], [innerWidth, innerHeight]]);

    if (this.svg) {
      this.zoom.transform(d3Select(this.svg), zoomIdentity);
    }
  }

  panOrZoom() {
    const { xScale, yScale } = this.props;
    const { viewTransform: currViewTransform } = this.state;

    const viewTransform = d3Event.transform.toString();

    if (viewTransform !== currViewTransform) {
      this.setState({
        xScaleZoomed: d3Event.transform.rescaleX(xScale.scale),
        yScaleZoomed: d3Event.transform.rescaleY(yScale.scale),
        viewTransform,
        tooltip: null,
      });
    }
  }

  render() {
    const {
      graph,
      width,
      height,
      xScale,
      yScale,
      colorScale,
      onClickNode,
    } = this.props;

    const {
      xScaleZoomed,
      yScaleZoomed,
      viewTransform,
      tooltip,
    } = this.state;

    const innerWidth = Math.max(...xScale.scale.range());
    const innerHeight = Math.max(...yScale.scale.range());

    return (
      <div style={{ position: 'relative', width, height }}>
        <svg
          role="img"
          aria-label="Event flow"
          width={width}
          height={height - 5}
          ref={(ref) => { this.svg = ref; }}
          style={{ cursor: 'move' }}
        >
          <Group
            top={margin.top}
            left={margin.left}
          >
            <defs>
              <clipPath id="clip">
                <rect x={-2} width={innerWidth + margin.right + 2} height={innerHeight} />
              </clipPath>
            </defs>
            <YAxis
              scale={yScaleZoomed || yScale.scale}
              label={yScale.label}
              labelOffset={margin.left * 0.6}
              width={innerWidth}
            />
            <g clipPath="url(#clip)">
              <g transform={viewTransform}>
                <SubTree
                  nodes={graph.root.children}
                  xScale={xScale.scale}
                  yScale={yScale.scale}
                  colorScale={colorScale.scale}
                  getX={xScale.accessor}
                  getY={yScale.accessor}
                  getColor={colorScale.accessor}
                  onMouseOver={this.onMouseOver}
                  onMouseOut={this.onMouseOut}
                  onClick={onClickNode}
                />
                <ZeroLine xScale={xScale.scale} yScale={yScale.scale} />
              </g>
            </g>
            <XAxis
              scale={xScaleZoomed || xScale.scale}
              label={xScale.label}
              labelOffset={margin.top * 0.6}
              height={innerHeight}
              tickFormat={xScale.tickFormat}
            />
          </Group>
        </svg>
        {tooltip &&
          <Tooltip
            svg={this.svg}
            root={graph.root}
            node={tooltip.node}
            link={tooltip.link}
            x={xScaleZoomed ?
              xScaleZoomed(xScale.scale.invert(tooltip.coords.x)) : tooltip.coords.x
            }
            y={yScaleZoomed ?
              yScaleZoomed(yScale.scale.invert(tooltip.coords.y)) : tooltip.coords.y
            }
            colorScale={colorScale.scale}
            getColor={colorScale.accessor}
          />}
      </div>
    );
  }
}

AggregatePanel.propTypes = propTypes;
AggregatePanel.defaultProps = defaultProps;

export default AggregatePanel;
