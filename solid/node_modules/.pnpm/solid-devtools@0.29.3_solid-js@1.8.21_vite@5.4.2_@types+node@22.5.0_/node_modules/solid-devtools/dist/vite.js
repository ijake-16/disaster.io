// src/vite/index.ts
import { transformAsync } from "@babel/core";

// src/vite/constants.ts
var SET_COMPONENT_LOC = "setComponentLocation";
var SET_COMPONENT_LOC_LOCAL = `_$${SET_COMPONENT_LOC}`;

// src/vite/location.ts
import { template } from "@babel/core";
import * as t2 from "@babel/types";
import {
  LOCATION_ATTRIBUTE_NAME,
  WINDOW_PROJECTPATH_PROPERTY
} from "@solid-devtools/debugger/types";
import p from "path";

// src/vite/utils.ts
import * as t from "@babel/types";
function getProgram(path) {
  while (!path.isProgram()) {
    path = path.parentPath;
  }
  return path;
}
function importFromRuntime(path, name, as) {
  const program = getProgram(path);
  program.unshiftContainer("body", [
    t.importDeclaration(
      [t.importSpecifier(t.identifier(as), t.identifier(name))],
      t.stringLiteral("solid-devtools/setup")
    )
  ]);
}

// src/vite/location.ts
var cwd = process.cwd();
var projectPathAst = template(`globalThis.${WINDOW_PROJECTPATH_PROPERTY} = %%loc%%;`)({
  loc: t2.stringLiteral(cwd)
});
var buildMarkComponent = template(`${SET_COMPONENT_LOC_LOCAL}(%%loc%%);`);
var isUpperCase = (s) => /^[A-Z]/.test(s);
var getLocationAttribute = (filePath, line, column) => `${filePath}:${line}:${column}`;
function getNodeLocationAttribute(node, state, isJSX = false) {
  if (!node.loc || typeof state.filename !== "string")
    return;
  return getLocationAttribute(
    p.relative(cwd, state.filename),
    node.loc.start.line,
    // 2 is added to place the caret after the "<" character
    node.loc.start.column + (isJSX ? 2 : 0)
  );
}
var transformCurrentFile = false;
var importedRuntime = false;
function importComponentSetter(path) {
  if (importedRuntime)
    return;
  importFromRuntime(path, SET_COMPONENT_LOC, SET_COMPONENT_LOC_LOCAL);
  importedRuntime = true;
}
var jsxLocationPlugin = (config) => ({
  name: "@solid-devtools/location",
  visitor: {
    Program(path, state) {
      transformCurrentFile = false;
      importedRuntime = false;
      if (typeof state.filename !== "string" || !state.filename.includes(cwd))
        return;
      transformCurrentFile = true;
      path.node.body.push(projectPathAst);
    },
    ...config.jsx && {
      JSXOpeningElement(path, state) {
        const { openingElement } = path.container;
        if (!transformCurrentFile || openingElement.name.type !== "JSXIdentifier")
          return;
        if (isUpperCase(openingElement.name.name))
          return;
        const location = getNodeLocationAttribute(openingElement, state, true);
        if (!location)
          return;
        openingElement.attributes.push(
          t2.jsxAttribute(
            t2.jsxIdentifier(LOCATION_ATTRIBUTE_NAME),
            t2.stringLiteral(location)
          )
        );
      }
    },
    ...config.components && {
      FunctionDeclaration(path, state) {
        if (!transformCurrentFile || !path.node.id || !isUpperCase(path.node.id.name))
          return;
        const location = getNodeLocationAttribute(path.node, state);
        if (!location)
          return;
        importComponentSetter(path);
        path.node.body.body.unshift(buildMarkComponent({ loc: t2.stringLiteral(location) }));
      },
      VariableDeclarator(path, state) {
        const { init, id } = path.node;
        if (!transformCurrentFile || !("name" in id) || !isUpperCase(id.name) || !init || init.type !== "FunctionExpression" && init.type !== "ArrowFunctionExpression" || init.body.type !== "BlockStatement")
          return;
        const location = getNodeLocationAttribute(path.node, state);
        if (!location)
          return;
        importComponentSetter(path);
        init.body.body.unshift(buildMarkComponent({ loc: t2.stringLiteral(location) }));
      }
    }
  }
});
var location_default = jsxLocationPlugin;

// src/vite/name.ts
import * as t3 from "@babel/types";
var nameId = t3.identifier("name");
var undefinedId = t3.identifier("undefined");
function equal(a, b) {
  if (a.type !== b.type)
    return false;
  switch (a.type) {
    case "Identifier":
    case "V8IntrinsicIdentifier":
      return a.name === b.name;
    case "PrivateName":
      return a.id === b.id;
    case "MemberExpression":
      return equal(a.object, b.object) && equal(a.property, b.property);
    default:
      return false;
  }
}
function addNameToOptions(node, argIndex, getNameProperty) {
  while (node.arguments.length < argIndex) {
    node.arguments.push(undefinedId);
  }
  if (node.arguments.length === argIndex) {
    const nameProperty = getNameProperty();
    nameProperty && node.arguments.push(t3.objectExpression([nameProperty]));
  } else {
    const options = node.arguments[argIndex];
    if (options.type !== "ObjectExpression")
      return;
    if (options.properties.some(
      (property) => property.type === "ObjectProperty" && property.key.type === "Identifier" && property.key.name === nameId.name
    )) {
      return;
    }
    const nameProperty = getNameProperty();
    nameProperty && options.properties.unshift(nameProperty);
  }
}
var SOURCE_TYPES = {
  returning: /* @__PURE__ */ new Set(["createSignal", "createMemo", "createStore", "createMutable"]),
  effect: /* @__PURE__ */ new Set(["createEffect", "createRenderEffect", "createComputed"])
};
var SOURCE_MODULES = {
  "solid-js": /* @__PURE__ */ new Set([
    "createSignal",
    "createMemo",
    "createEffect",
    "createRenderEffect",
    "createComputed"
  ]),
  "solid-js/store": /* @__PURE__ */ new Set(["createStore", "createMutable"])
};
var OPTIONS_ARG = {
  createSignal: 1,
  createMemo: 2,
  createStore: 1,
  createMutable: 1,
  createEffect: 2,
  createRenderEffect: 2,
  createComputed: 2
};
function getTarget(node, sources, includedOptions) {
  return Object.entries(sources).find(
    ([sourcesKey, someSources]) => includedOptions.has(sourcesKey) && someSources.some((source) => equal(node, source))
  )?.[0];
}
var Sources;
var FileWithImports = false;
var namePlugin = {
  name: "@solid-devtools/name",
  visitor: {
    Program() {
      Sources = {
        createSignal: [],
        createMemo: [],
        createStore: [],
        createMutable: [],
        createEffect: [],
        createRenderEffect: [],
        createComputed: []
      };
      FileWithImports = false;
    },
    // Track imported references to sources
    ImportDeclaration(path) {
      const node = path.node;
      const source = node.source.value;
      const targets = SOURCE_MODULES[source];
      if (!targets)
        return;
      for (const s of node.specifiers) {
        switch (s.type) {
          case "ImportNamespaceSpecifier":
            for (const target of targets) {
              Sources[target].push(t3.memberExpression(s.local, t3.identifier(target)));
              FileWithImports = true;
            }
            break;
          case "ImportSpecifier": {
            const name = s.imported.type === "Identifier" ? s.imported.name : s.imported.value;
            if (targets.has(name)) {
              Sources[name].push(s.local);
              FileWithImports = true;
            }
            break;
          }
        }
      }
    },
    VariableDeclaration(path) {
      if (!FileWithImports)
        return;
      const declarations = path.node.declarations;
      for (const declaration of declarations) {
        const init = declaration.init;
        if (!init || init.type !== "CallExpression")
          continue;
        const target = getTarget(init.callee, Sources, SOURCE_TYPES.returning);
        if (!target)
          continue;
        addNameToOptions(init, OPTIONS_ARG[target], () => {
          const id = declaration.id;
          const name = (() => {
            switch (id.type) {
              case "Identifier":
                return id.name;
              case "ArrayPattern": {
                if (!id.elements.length)
                  return;
                const first = id.elements[0];
                if (!first)
                  return;
                if (first.type !== "Identifier")
                  return;
                return first.name;
              }
            }
          })();
          return name ? t3.objectProperty(nameId, t3.stringLiteral(name)) : void 0;
        });
      }
    },
    CallExpression(path) {
      if (!FileWithImports)
        return;
      const node = path.node;
      const target = getTarget(node.callee, Sources, SOURCE_TYPES.effect);
      if (!target)
        return;
      addNameToOptions(node, 2, () => {
        let name;
        let parentPath = path.parentPath;
        for (let i = 0; i < 5; i++) {
          if (!parentPath)
            return;
          if (parentPath.node.type === "CallExpression" && parentPath.node.callee.type === "Identifier") {
            name = `to_${parentPath.node.callee.name}`;
            break;
          }
          if ((parentPath.node.type === "FunctionDeclaration" || parentPath.node.type === "VariableDeclarator") && parentPath.node.id?.type === "Identifier") {
            name = `in_${parentPath.node.id.name}`;
            break;
          }
          parentPath = parentPath.parentPath;
        }
        if (!name)
          return;
        return t3.objectProperty(nameId, t3.stringLiteral(name));
      });
    }
  }
};
var name_default = namePlugin;

// src/vite/index.ts
function getFileExtension(filename) {
  const index = filename.indexOf("?");
  const filenameWithoutQuery = index !== -1 ? filename.slice(0, index) : filename;
  const lastDotIndex = filenameWithoutQuery.lastIndexOf(".");
  return lastDotIndex !== -1 ? filenameWithoutQuery.slice(lastDotIndex + 1) : "";
}
var devtoolsPlugin = (_options = {}) => {
  const options = {
    autoname: _options.autoname ?? false,
    locator: _options.locator ? {
      targetIDE: false,
      jsxLocation: false,
      componentLocation: false,
      ..._options.locator === true ? {} : _options.locator
    } : void 0
    // SDT_DEV: _options.SDT_DEV ?? false,
  };
  const enabledJsxLocation = !!options.locator?.jsxLocation;
  const enabledComponentLocation = !!options.locator?.componentLocation;
  let enablePlugin = false;
  const projectRoot = process.cwd();
  return {
    name: "solid-devtools",
    enforce: "pre",
    configResolved(config) {
      enablePlugin = config.command === "serve" && config.mode !== "production";
    },
    resolveId(id) {
      if (enablePlugin && id === "solid-devtools" /* Main */)
        return "solid-devtools" /* Main */;
    },
    load(id) {
      if (!enablePlugin || id !== "solid-devtools" /* Main */)
        return;
      let code = `import "${"solid-devtools/setup" /* Setup */}";`;
      if (options.locator) {
        code += `
import { setLocatorOptions } from "${"solid-devtools/setup" /* Setup */}";
        setLocatorOptions(${JSON.stringify(options.locator)});`;
      }
      return code;
    },
    async transform(source, id, transformOptions) {
      if (transformOptions?.ssr || !enablePlugin)
        return;
      const extension = getFileExtension(id);
      if (!["mjs", "cjs", "cts", "mts", "js", "jsx", "ts", "tsx"].includes(extension))
        return;
      const isJSX = extension === "jsx" || extension === "tsx";
      const plugins = [];
      if ((enabledJsxLocation || enabledComponentLocation) && isJSX) {
        plugins.push(
          location_default({
            jsx: enabledJsxLocation,
            components: enabledComponentLocation
          })
        );
      }
      if (options.autoname) {
        plugins.push(name_default);
      }
      if (plugins.length === 0)
        return { code: source };
      plugins.splice(0, 0, ["@babel/plugin-syntax-typescript", { isTSX: isJSX }]);
      const result = await transformAsync(source, {
        babelrc: false,
        configFile: false,
        root: projectRoot,
        filename: id,
        sourceFileName: id,
        sourceMaps: true,
        plugins
      });
      if (result) {
        return { code: result.code, map: result.map };
      }
    }
  };
};
export {
  devtoolsPlugin as default
};
