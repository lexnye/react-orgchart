import * as d3 from 'd3';

export function renderLines(config = {}) {
  const {
    svg,
    links,
    margin,
    nodeWidth,
    nodeHeight,
    borderColor,
    sourceNode,
    treeData,
    lineType,
    animationDuration,
  } = config;

  const parentNode = sourceNode || treeData;

  // Select all the links to render the lines
  const link = svg.selectAll('path.link')
    .data(links, function (d) {
      return d.id;
    });

  // Define the curved line function
  const curve = d3.line()
    .x(d => d.x + nodeWidth / 2)
    .y(d => d.y + nodeHeight / 2)
    .curve(d3.curveLinear);

  // Define the angled line function
  const angle = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveLinear);

  if (lineType === 'angle') {
    // Enter any new links at the parent's previous position.
    var linkEnter = link
      .enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#A9A9A9')
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 1.25)
      .attr('d', d => {
        const linePoints = [
          {
            x: d.source.x + parseInt(nodeWidth / 2, 10),
            y: d.source.y + nodeHeight + 2,
          },
          {
            x: d.source.x + parseInt(nodeWidth / 2, 10),
            y: d.source.y + nodeHeight + 2,
          },
          {
            x: d.source.x + parseInt(nodeWidth / 2, 10),
            y: d.source.y + nodeHeight + 2,
          },
          {
            x: d.source.x + parseInt(nodeWidth / 2, 10),
            y: d.source.y + nodeHeight + 2,
          },
        ];
        console.log(d.source.x, parseInt(nodeWidth / 2, 10));

        return angle(linePoints);
      });

    var linkUpdate = linkEnter.merge(link);

    // Transition links to their new position.
    linkUpdate
      .transition()
      .duration(animationDuration)
      .attr('d', d => {
        const linePoints = [
          {
            x: d.source.x + parseInt(nodeWidth / 2, 10),
            y: d.source.y + nodeHeight,
          },
          {
            x: d.source.x + parseInt(nodeWidth / 2, 10),
            y: d.target.y - margin.top / 2,
          },
          {
            x: d.target.x + parseInt(nodeWidth / 2, 10),
            y: d.target.y - margin.top / 2,
          },
          {
            x: d.target.x + parseInt(nodeWidth / 2, 10),
            y: d.target.y,
          },
        ];

        return angle(linePoints);
      });

    // Animate the existing links to the parent's new position
    link
      .exit()
      .transition()
      .duration(animationDuration)
      .attr('d', d => {
        const lineNode = config.callerNode ? config.callerNode : parentNode;
        const linePoints = [
          {
            x: lineNode.x + parseInt(nodeWidth / 2, 10),
            y: lineNode.y + nodeHeight + 2,
          },
          {
            x: lineNode.x + parseInt(nodeWidth / 2, 10),
            y: lineNode.y + nodeHeight + 2,
          },
          {
            x: lineNode.x + parseInt(nodeWidth / 2, 10),
            y: lineNode.y + nodeHeight + 2,
          },
          {
            x: lineNode.x + parseInt(nodeWidth / 2, 10),
            y: lineNode.y + nodeHeight + 2,
          },
        ];

        return angle(linePoints);
      })
      .each('end', () => {
        config.callerNode = null;
      });
  } else if (lineType === 'curve') {
    var linkEnter = link
      .enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('stroke', borderColor)
      .attr('fill', 'none')
      .attr('x', nodeWidth / 2)
      .attr('y', nodeHeight / 2)
      .attr('d', d => {
        const source = {
          x: parentNode.x0,
          y: parentNode.y0,
        };

        console.log({ source });

        return curve([source, source]);
      });

    var linkUpdate = linkEnter.merge(link);

    // Transition links to their new position.
    linkUpdate
      .transition()
      .duration(animationDuration)
      .attr('d', curve);

    // Transition exiting nodes to the parent's new position.
    link
      .exit()
      .transition()
      .duration(animationDuration)
      .attr('d', function (d) {
        const source = {
          x: parentNode.x,
          y: parentNode.y,
        };
        return curve({
          source,
          target: source,
        });
      })
      .remove();
  }
}
