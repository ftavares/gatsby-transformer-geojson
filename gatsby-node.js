const _ = require(`lodash`);

const fs = require('fs');

async function onCreateNode({
  node,
  actions,
  createNodeId,
  createContentDigest
}) {
  const {
    createNode,
    createParentChildLink
  } = actions;

  function transformObject(obj, id, type) {
    const jsonNode = { ...obj,
      id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(obj),
        type
      }
    };
    createNode(jsonNode);
    createParentChildLink({
      parent: node,
      child: jsonNode
    });
  }

  if (node.internal.mediaType !== `application/geo+json`) {
    return;
  }

  const content = await fs.readFileSync(node.absolutePath);
  const parsedContent = JSON.parse(content);

  if (_.isArray(parsedContent)) {
    parsedContent.forEach((obj, i) => {
      transformObject(obj, obj.id ? obj.id : createNodeId(`${node.id} [${i}] >>> GEOJSON`), 'GeoJson');
    });
  } else if (_.isPlainObject(parsedContent)) {
    transformObject(parsedContent, parsedContent.id ? parsedContent.id : createNodeId(`${node.id} >>> GEOJSON`), 'GeoJson');
  }
}

exports.onCreateNode = onCreateNode;