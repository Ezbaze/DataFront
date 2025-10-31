const Module = require("module");

if (process.env.GORILLA_BUILD !== "1") {
  return;
}

const originalLoad = Module._load;

Module._load = function patchedLoad(request, parent, isMain) {
  try {
    if (request === "typescript") {
      return originalLoad.call(this, "typescript4", parent, isMain);
    }

    if (request === "rollup-plugin-typescript") {
      return function noopTypescriptPlugin() {
        return {
          name: "noop-typescript",
          transform(code) {
            return { code, map: null };
          },
        };
      };
    }
  } catch (err) {
    console.warn(
      "alias-typescript.cjs: redirection failed",
      err && err.message
    );
  }

  return originalLoad.call(this, request, parent, isMain);
};
