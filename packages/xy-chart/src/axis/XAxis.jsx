import React from 'react';
import PropTypes from 'prop-types';
import { AxisBottom, AxisTop } from '@vx/axis';

import { axisStylesShape, tickStylesShape } from '../utils/propShapes';

const propTypes = {
  axisStyles: axisStylesShape,
  hideZero: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  numTicks: PropTypes.number,
  orientation: PropTypes.oneOf(['bottom', 'top']),
  rangePadding: PropTypes.number,
  tickStyles: tickStylesShape,
  tickLabelComponent: PropTypes.element,
  tickFormat: PropTypes.func,

  // probably injected by parent
  innerHeight: PropTypes.number,
  scale: PropTypes.func,
};

const defaultProps = {
  axisStyles: {},
  hideZero: false,
  innerHeight: null,
  label: null,
  numTicks: null,
  orientation: 'bottom',
  rangePadding: null,
  scale: null,
  tickFormat: null,
  tickLabelComponent: null,
  tickStyles: {},
};

export default function XAxis({
  axisStyles,
  innerHeight,
  hideZero,
  label,
  numTicks,
  orientation,
  rangePadding,
  scale,
  tickFormat,
  tickLabelComponent,
  tickStyles,
}) {
  if (!scale || !innerHeight) return null;
  const Axis = orientation === 'bottom' ? AxisBottom : AxisTop;
  return (
    <Axis
      top={orientation === 'bottom' ? innerHeight : 0}
      left={0}
      rangePadding={rangePadding}
      hideTicks={numTicks === 0}
      hideZero={hideZero}
      label={typeof label === 'string' && axisStyles.label ?
        <text {...(axisStyles.label || {})[orientation]}>
          {label}
        </text>
        : label
      }
      numTicks={numTicks}
      scale={scale}
      stroke={axisStyles.stroke}
      strokeWidth={axisStyles.strokeWidth}
      tickFormat={tickFormat}
      tickLength={tickStyles.tickLength}
      tickStroke={tickStyles.stroke}
      tickLabelComponent={tickLabelComponent || (tickStyles.label &&
        <text {...(tickStyles.label || {})[orientation]} />
      )}
    />
  );
}

XAxis.propTypes = propTypes;
XAxis.defaultProps = defaultProps;
XAxis.displayName = 'XAxis';
