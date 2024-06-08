function drawTree(data){
    let treeData, root, tree, svg, gLink, gNode, diagonal, horizontalDistance;
    let nodes, links;
    let leftMost, rightMost;
    let height, transition, node, nodeEnter;
    let nodeUpdate, nodeExit, link, linkEnter;

    let width = 928;
    let marginTop = 30;
    let marginRight = 10;
    let marginBottom = 10;
    let marginLeft = 60;

    let verticalDistance = 30;

    let duration = 100;
    
    treeData = data;
    root = d3.hierarchy(treeData);

    horizontalDistance = (width - marginRight - marginLeft) / (1 + root.height);

    tree = d3.tree().nodeSize([verticalDistance, horizontalDistance]);
    diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    svg = d3.select('#tidy-tree')
        .attr("height", verticalDistance)
        .attr("width", width)
        .attr("viewBox", [-marginLeft, -marginTop, width, verticalDistance])

    // group layer for links
    gLink = svg.append("g")

    // group layer for nodes
    gNode = svg.append("g")
        .attr("cursor", "pointer")

    root.descendants().forEach((d, i) => {
        d.id = i;
        d.x0 = d.x;
        d.y0 = d.y;
        // this is to store the original children list
        d._children = d.children;
        // show few directories expanded and few collapsed
        if (d.depth && d.data.name.length > 3 && d.data.name.length < 7)
            d.children = null;
    });

    function update(source){
        tree(root);
        //get nodes and links
        nodes = root.descendants();
        links = root.links();
    
        // find left most and right most node of tree
        leftMost = root;
        rightMost = root;
        // pre order traversal
        root.eachBefore(node => {
            if(node.x < leftMost.x) leftMost = node;
            if(node.x > rightMost.x) rightMost = node;
        })
    
        // since the tree is displayed horizontaly, the rightmost will be shown top most and left most is bottom most
        height = rightMost.x - leftMost.x + marginTop + marginBottom;
    
        // adding a small animation for the canvas to appear with a small animation
        transition = svg.transition()
                .duration(duration)
                .attr('height', height)
                .attr('viewBox', [-marginLeft, leftMost.x - marginTop, width, height])
    
        node = gNode.selectAll('g').data(nodes, d => d.id);
        link = gLink.selectAll("path").data(links, d => d.target.id);
    
        // enter - new nodes
        nodeEnter = node.enter().append('g')
                        .on("click", (event, d) => {
                            // if currently showing children then hide
                            // else show the stored list _children
                            d.children = d.children ? null : d._children;
                            update(d);
                        });
    
        nodeEnter.append("circle")
                        // diff class depending directory or file
                        .attr('class', d => d._children ? 'node-circle' : "leaf-circle")
                        .attr("r", 5)
    
        nodeEnter.append("text")
                        .attr("dy", "3")
                        .attr("x", d => d._children ? -6 : 6)
                        .attr("text-anchor", d => d._children ? "end" : "start")
                        .text(d => d.data.name)
                        .style("font-size", 12)
    
        // existing nodes
        nodeUpdate = node.merge(nodeEnter).transition(transition)
                        .attr("transform", d => `translate(${d.y},${d.x})`)
    
        // exit nodes
        nodeExit = node.exit().transition(transition).remove()
                        .attr("transform", d => `translate(${source.y},${source.x})`);
    
        // enter links
        linkEnter = link.enter().append("path")
                        .attr('class', 'edge')
    
        // existing links
        link.merge(linkEnter).transition(transition)
                        .attr("d", diagonal);
    
        // exit links
        link.exit().transition(transition).remove()
                        .attr("d", d => {
                          const o = {x: source.x, y: source.y};
                          return diagonal({source: o, target: o});
                        });
    
        // changing the old positions for transition.
        root.eachBefore(d => {
                      d.x0 = d.x;
                      d.y0 = d.y;
                    });
    }

    update(root);
}