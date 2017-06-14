import { Group } from '@vx/group';
import React from 'react';
import PropTypes from 'prop-types';

import Link from './Link';
import Node, { DEFAULT_NODE_WIDTH } from './Node';

import { EVENT_COUNT } from '../constants';
import getCoordsFromEvent from '../utils/getCoordsFromEvent';
import { nodeShape } from '../propShapes';

const propTypes = {
  nodes: PropTypes.objectOf(nodeShape).isRequired,
  nodeSorter: PropTypes.func, // could default to # events

  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  colorScale: PropTypes.func.isRequired,

  getX: PropTypes.func.isRequired,
  getY: PropTypes.func.isRequired,
  getColor: PropTypes.func.isRequired,
  yOffset: PropTypes.number,

  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  onClick: PropTypes.func,
};

const defaultProps = {
  nodeSorter: (a, b) => b[EVENT_COUNT] - a[EVENT_COUNT],
  onMouseOut: () => {},
  onMouseOver: () => {},
  onClick: () => {},
  yOffset: 0,
};

class SubTree extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showEventsFor: null,
    };

    this.onClickNode = this.onClickNode.bind(this);
    this.onClickLink = this.onClickLink.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
  }

  onMouseOver(event) {
    const target = event.target;
    const { node, link } = this.getNodeFromTarget(target);
    if (node || link) {
      const coords = getCoordsFromEvent(target, event);
      this.props.onMouseOver({ node, link, coords, event });
    }
  }

  onMouseOut() {
    this.props.onMouseOut();
  }

  onClickNode(event) {
    const target = event.target;
    const { node } = this.getNodeFromTarget(target);
    if (node) {
      const coords = getCoordsFromEvent(target, event);
      this.props.onClick({ coords, event, node });
    }
  }

  onClickLink(event) {
    const target = event.target;
    const { link } = this.getNodeFromTarget(target);
    console.log('link', link.target.events);
  }

  getNodeFromTarget(target) {
    if (target) {
      const result = { node: null, link: null };
      const { nodes } = this.props;
      const group = SVGGElement === target.constructor ? target : target.parentElement;
      if (group && group.attributes['data-node']) {
        result.node = nodes[group.attributes['data-node'].value];
      } else if (group && group.attributes['data-target']) {
        const targetNode = nodes[group.attributes['data-target'].value];
        result.link = {
          source: targetNode.parent,
          target: targetNode,
        };
      }
      return result;
    }
    return null;
  }

  render() {
    const {
      nodeSorter,
      nodes,
      xScale,
      yScale,
      colorScale,
      getX,
      getY,
      getColor,
      yOffset: parentYOffset,
    } = this.props;

    const sortedNodes = Object.values(nodes).sort(nodeSorter);
    const yOffset = { left: parentYOffset, right: parentYOffset };

    return (
      <Group className="subtree">
        {sortedNodes.map((node) => {
          const offset = node.depth >= 0 ? 'right' : 'left';
          const hasParent = Boolean(node.parent);
          const hasChildren = node.children && Object.keys(node.children).length;

          const top = yOffset[offset];
          const left = xScale(getX(node));
          const parentLeft = hasParent && xScale(getX(node.parent));
          const height = yScale(getY(node));
          const nodeColor = colorScale(getColor(node));

          yOffset[offset] += height;

          return (
            <g key={node.id} style={{ cursor: 'pointer' }}>
              {/* link back to the parent */}
              {hasParent &&
                <Link
                  source={node.parent}
                  target={node}
                  x={Math.min(left, parentLeft) + (left > parentLeft ? DEFAULT_NODE_WIDTH : 0)}
                  y={top}
                  width={Math.abs(left - parentLeft)}
                  height={Math.max(1, height)}
                  onClick={this.onClickLink}
                  onMouseOver={this.onMouseOver}
                  onMouseOut={this.onMouseOut}
                />
              }
              <Node
                node={node}
                x={left}
                y={top}
                height={Math.max(1, height)}
                fill={nodeColor}
                onClick={this.onClickNode}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
                data-node={node.id}
              />
              {hasChildren &&
                <SubTree
                  {...this.props}
                  yOffset={top}
                  nodes={node.children}
                />}
            </g>
          );
        })}
      </Group>
    );
  }
}

SubTree.propTypes = propTypes;
SubTree.defaultProps = defaultProps;

export default SubTree;