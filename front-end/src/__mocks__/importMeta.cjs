/**
 * Custom ts-jest AST transformer that replaces import.meta.env
 * with a process.env-based equivalent for Jest CJS compatibility.
 */
const ts = require('typescript');

const transformer = (program) => (context) => (sourceFile) => {
  function visitor(node) {
    // Replace import.meta.env.DEV → (process.env.NODE_ENV !== 'production')
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isMetaProperty(node.expression.expression) &&
      node.expression.name.text === 'env' &&
      node.name.text === 'DEV'
    ) {
      return context.factory.createFalse();
    }
    // Replace import.meta.env.PROD → true
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isMetaProperty(node.expression.expression) &&
      node.expression.name.text === 'env' &&
      node.name.text === 'PROD'
    ) {
      return context.factory.createTrue();
    }
    // Replace import.meta.env → { DEV: false, PROD: true }
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isMetaProperty(node.expression) &&
      node.name.text === 'env'
    ) {
      return context.factory.createObjectLiteralExpression([
        context.factory.createPropertyAssignment('DEV', context.factory.createFalse()),
        context.factory.createPropertyAssignment('PROD', context.factory.createTrue()),
      ]);
    }
    return ts.visitEachChild(node, visitor, context);
  }
  return ts.visitNode(sourceFile, visitor);
};

const name = 'import-meta-env-transformer';
const version = 1;
const factory = transformer;

module.exports = { name, version, factory };
