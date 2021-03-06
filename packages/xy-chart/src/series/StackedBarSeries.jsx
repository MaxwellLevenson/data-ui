import React from 'react';
import PropTypes from 'prop-types';
import { BarStack } from '@vx/shape';

import { stackedBarSeriesDataShape } from '../utils/propShapes';
import { scaleTypeToScale } from '../utils/chartUtils';
import { colors } from '../theme';

const propTypes = {
  data: stackedBarSeriesDataShape.isRequired,
  stackKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  stackFills: PropTypes.arrayOf(PropTypes.string),
  stroke: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  strokeWidth: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),

  // these will likely be injected by the parent xychart
  xScale: PropTypes.func,
  yScale: PropTypes.func,
};

const defaultProps = {
  stackFills: colors.categories,
  stroke: '#FFFFFF',
  strokeWidth: 1,
  xScale: null,
  yScale: null,
};

const x = d => d.x;

export default function StackedBarSeries({
  data,
  stackKeys,
  stackFills,
  stroke,
  strokeWidth,
  xScale,
  yScale,
}) {
  if (!xScale || !yScale) return null;
  if (!xScale.bandwidth) { // @todo figure this out/be more graceful
    throw new Error("'StackedBarSeries' requires a 'band' type xScale");
  }
  const maxHeight = (yScale.range() || [0])[0];
  const zScale = scaleTypeToScale.ordinal({ range: stackFills, domain: stackKeys });
  return (
    <BarStack
      data={data}
      keys={stackKeys}
      height={maxHeight}
      x={x}
      xScale={xScale}
      yScale={yScale}
      zScale={zScale}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

StackedBarSeries.propTypes = propTypes;
StackedBarSeries.defaultProps = defaultProps;
StackedBarSeries.displayName = 'StackedBarSeries';
